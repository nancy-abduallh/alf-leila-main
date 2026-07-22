import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../providers/language";

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoggingIn, loginError, refresh } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      const { data: freshUser } = await refresh();
      navigate(freshUser?.role === "admin" ? "/admin" : "/");
    } catch {
      // surfaced via loginError
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>{t("auth.loginTitle")}</CardTitle>
          <CardDescription>{t("auth.loginDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.emailPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.passwordPlaceholder")}
              />
            </div>
            {loginError && (
              <p className="text-destructive text-sm">{loginError.message}</p>
            )}
            <Button type="submit" className="w-full" size="lg" disabled={isLoggingIn}>
              {isLoggingIn ? t("auth.signingIn") : t("auth.signIn")}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-4">
            {t("auth.noAccount")}{" "}
            <Link to="/register" className="text-primary underline underline-offset-4">
              {t("auth.createOne")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}