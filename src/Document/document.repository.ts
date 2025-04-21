import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class DocumentRepository {

    async getAllDocuments() {
        return await prisma.document.findMany()
    }

    async getAllDocumentsByUserId(userId: string) {
        return await prisma.document.findMany({
            where: { ownerId : userId },
        })
    }

    async getDocumentById(id: string) {
        return await prisma.document.findUnique({
            where: { id },
        })
    }

    async saveDocument(document: any) {

        if(document.id === undefined) {
            return await prisma.document.create({
                data: document,
            })
        }

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