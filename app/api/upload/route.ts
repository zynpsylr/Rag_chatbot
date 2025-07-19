import { upsertData } from "@/app/lib/chain";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return new Response("File is required", { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        await upsertData(buffer);

        return new Response(JSON.stringify({ ok: true, message: "File uploaded successfully" }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("Error in upload API:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}