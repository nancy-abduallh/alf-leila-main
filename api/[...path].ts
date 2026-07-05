import app from "../server/boot";

export default async function handler(request: Request) {
    return app.fetch(request);
}