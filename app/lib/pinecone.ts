import { PineconeStore } from '@langchain/pinecone'
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { embeddings } from "./model";


const pinecone = new PineconeClient({
    apiKey: process.env.PINECONE_API_KEY!
});

const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

 export const vectorStore = new PineconeStore(embeddings, {
    pineconeIndex: index,
    maxConcurrency: 5,
});





