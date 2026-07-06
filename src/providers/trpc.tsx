import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import superjson from "superjson";
import type { AppRouter } from "../../server/router";
import type { ReactNode } from "react";

export const trpc = createTRPCReact<AppRouter>();

const queryClient = new QueryClient();
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      async fetch(input, init) {
        const response = await globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });

        // If the /api serverless function isn't deployed/reachable, Vercel
        // (or any proxy in front of it) returns an HTML error page instead
        // of JSON. Catching that here turns a cryptic "Unexpected token
        // 'T'/'<' ... is not valid JSON" into a message that points at the
        // actual problem instead of the symptom.
        const contentType = response.headers.get("content-type") ?? "";
        if (!contentType.includes("application/json")) {
          const bodyPreview = await response
            .clone()
            .text()
            .then((t) => t.slice(0, 150), () => "");
          throw new Error(
            `API request to ${typeof input === "string" ? input : "trpc"} failed with ` +
            `status ${response.status} ${response.statusText}. Expected JSON but got ` +
            `"${contentType || "unknown content-type"}". Response started with: ` +
            `${JSON.stringify(bodyPreview)}. This usually means the /api serverless ` +
            `function failed to build or isn't deployed — check the Deployments tab ` +
            `in Vercel for build errors, or hit /api/health directly.`,
          );
        }

        return response;
      },
    }),
  ],
});

export function TRPCProvider({ children }: { children: ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}