export const config = {
    runtime: "nodejs",
};

export default async function handler(request: Request) {
    try {
        const { default: app } = await import("../server/boot");
        return await app.fetch(request);
    } catch (error) {
        // If any module in the import chain (env validation, db setup, etc.)
        // throws during initialization, this used to crash the function
        // silently. Surfacing it as JSON makes the real cause visible
        // instead of a bare 404/500 with no information.
        console.error("Unhandled error in API handler:", error);
        return new Response(
            JSON.stringify({
                error: "Internal Server Error",
                message: error instanceof Error ? error.message : String(error),
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
}