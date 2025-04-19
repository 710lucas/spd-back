import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class DocumentRepository {

    async getAllDocuments() {
        return await prisma.document.findMany()
    }


    async getDocumentById(id: string) {
        return await prisma.document.findUnique({
            where: { id },
        })
    }

    async saveDocument(document: any) {
        return await prisma.document.upsert({
            where: { id: document.id },
            update: document,
            create: document,
        })
    }

    //TODO: adicionar deleteLogico
    async deleteDocument(id: string) {
        return await prisma.document.delete({
            where: { id },
        })
    }

}