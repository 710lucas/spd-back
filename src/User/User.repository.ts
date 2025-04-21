import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class UserRepository {
    async getAllUsers() {
        return await prisma.user.findMany();
    }

    async getUserById(id: string) {
        return await prisma.user.findUnique({
            where: { id },
        });
    }

    async saveUser(user: Prisma.UserCreateInput) {

        if (user.id === undefined) {
            return await prisma.user.create({
                data: user,
            });
        }

        return await prisma.user.upsert({
            where: { id: user.id },
            update: user,
            create: user,
        });
    }

    async getUserByUsername(username: string) {
        return await prisma.user.findFirst({
            where: { username : username},
        });
    }
}