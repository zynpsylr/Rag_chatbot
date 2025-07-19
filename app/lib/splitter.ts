
import mammoth from 'mammoth'
import { Document } from "langchain/document"
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'

export async function readAndSplitDocx(buffer: Buffer): Promise<Document[]> {

    // Word dosyasını metne çevir
    const result = await mammoth.extractRawText({buffer})
    const text = result.value

    // Metni parçalara böl
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 100,
    })
    return await splitter.createDocuments([text])
}
