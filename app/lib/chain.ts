import {model} from "./model";
import {readAndSplitDocx} from "./splitter";
import { vectorStore } from "./pinecone";
import { RetrievalQAChain } from "langchain/chains";

// Verilen belgeyi okuyup split eder, Pinecone'a ekler
export async function upsertData(buffer : Buffer): Promise<void> {
    try {
        const docs = await readAndSplitDocx(buffer);
        await vectorStore.addDocuments(docs);
        console.log("Upsert işlemi başarılı. Döküman sayısı:", docs.length);
    } catch (error) {
        console.error("Error upserting data:", error);
        throw error;
    }
}

// Kullanıcının sorduğu soruya cevap döner
export async function queryChain(question: string): Promise<string> {
    try {
        const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
            returnSourceDocuments: false,
        });
        const response = await chain.call({ query: question });
        return response.text;
    } catch (error) {
        console.error("Error querying chain:", error);
        throw error;
    }
}


