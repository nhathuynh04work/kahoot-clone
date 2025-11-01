import { Injectable } from "@nestjs/common";
import { Prisma, User } from "../../generated/prisma/client.js";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    user(input: Prisma.UserWhereUniqueInput): Promise<User | null> {
        return this.prisma.user.findUnique({ where: input });
    }

    create(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({ data });
    }
}
