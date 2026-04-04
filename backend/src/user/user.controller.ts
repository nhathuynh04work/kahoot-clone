import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { UserService } from "./user.service.js";

@Controller("users")
export class UsersController {
    constructor(private userService: UserService) {}

    @Get(":id")
    async getPublicUser(@Param("id", ParseIntPipe) id: number) {
        const user = await this.userService.getUserWithRole({ id });
        if (!user) return null;

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: (user as any).avatarUrl ?? null,
            role: user.role ?? "USER",
        };
    }
}

