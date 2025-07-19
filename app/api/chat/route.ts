import { queryChain } from "@/app/lib/chain";

export async function POST(request: Request){

    try {
        const { question } = await request.json();
        if (!question) {
            return new Response("Question is required", { status: 400 });
        }

        const answer = await queryChain(question);

        return new Response(JSON.stringify({ answer }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    }
    catch (error) {
        console.error("Error in RAG API:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}