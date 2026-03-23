import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from "@nestjs/common";
import { UserService } from "../../user/user.service.js";
import { type JwtUser } from "../user.decorator.js";

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private readonly userService: UserService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const jwtUser = req.user as JwtUser | undefined;

        if (!jwtUser) {
            throw new ForbiddenException("Admin access required");
        }

        const user = await this.userService.getUserWithRole({ id: jwtUser.id });
        if (!user || user.role !== "ADMIN") {
            throw new ForbiddenException("Admin access required");
        }

        return true;
    }
}

