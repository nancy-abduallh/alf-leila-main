import { trpc } from "@/providers/trpc";
import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { LOGIN_PATH } from "@/const";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = LOGIN_PATH } =
    options ?? {};

  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = trpc.auth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
    },
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      navigate(redirectPath);
    },
  });

  const login = useCallback(
    (email: string, password: string) =>
      loginMutation.mutateAsync({ email, password }),
    [loginMutation],
  );

  const register = useCallback(
    (name: string, email: string, password: string) =>
      registerMutation.mutateAsync({ name, email, password }),
    [registerMutation],
  );

  const logout = useCallback(() => logoutMutation.mutate(), [logoutMutation]);

  useEffect(() => {
    if (redirectOnUnauthenticated && !isLoading && !user) {
      const currentPath = window.location.pathname;
      if (currentPath !== redirectPath) {
        navigate(redirectPath);
      }
    }
  }, [redirectOnUnauthenticated, isLoading, user, navigate, redirectPath]);

  return useMemo(
    () => ({
      user: user ?? null,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
      isLoading: isLoading || logoutMutation.isPending,
      error,
      login,
      isLoggingIn: loginMutation.isPending,
      loginError: loginMutation.error,
      register,
      isRegistering: registerMutation.isPending,
      registerError: registerMutation.error,
      logout,
      refresh: refetch,
    }),
    [
      user,
      isLoading,
      logoutMutation.isPending,
      error,
      login,
      loginMutation.isPending,
      loginMutation.error,
      register,
      registerMutation.isPending,
      registerMutation.error,
      logout,
      refetch,
    ],
  );
}