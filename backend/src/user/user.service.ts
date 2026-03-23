import { Injectable } from "@nestjs/common";
import { Prisma, User } from "../generated/prisma/client.js";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    getUser(input: Prisma.UserWhereUniqueInput): Promise<User | null> {
        return this.prisma.user.findUnique({ where: input });
    }

    getUserWithRole(input: Prisma.UserWhereUniqueInput) {
        // Role is now stored directly on `User` as an enum field.
        return this.prisma.user.findUnique({ where: input });
    }

    create(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({ data });
    }
}
