import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Patch,
    Param,
    Query,
    UseGuards,
} from "@nestjs/common";
import { JwtHttpGuard } from "../auth/guard/jwt-http.guard.js";
import { AdminGuard } from "../auth/guard/admin.guard.js";
import { AdminService } from "./admin.service.js";

@Controller("admin/dashboard")
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Get("stats")
    @UseGuards(JwtHttpGuard, AdminGuard)
    async getStats(@Query("rangeDays") rangeDays?: string) {
        const parsed = rangeDays ? parseInt(rangeDays, 10) : NaN;
        const safeRangeDays = Number.isFinite(parsed)
            ? Math.max(1, parsed)
            : undefined;

        return this.adminService.getDashboardStats({
            rangeDays: safeRangeDays,
        });
    }

    @Get("users")
    @UseGuards(JwtHttpGuard, AdminGuard)
    async getUsersPage(
        @Query("page") page?: string,
        @Query("pageSize") pageSize?: string,
        @Query("q") q?: string,
        @Query("sort") sort?: string,
    ) {
        const parsedPage = page ? parseInt(page, 10) : 1;
        const parsedPageSize = pageSize ? parseInt(pageSize, 10) : 50;

        const safePage = Number.isFinite(parsedPage) ? Math.max(1, parsedPage) : 1;
        const safePageSize = Number.isFinite(parsedPageSize)
            ? Math.min(100, Math.max(1, parsedPageSize))
            : 50;

        const normalizedSort =
            sort === "createdAt_asc" ? "createdAt_asc" : "createdAt_desc";

        return this.adminService.getUsersPage({
            page: safePage,
            pageSize: safePageSize,
            q,
            sort: normalizedSort,
        });
    }

    @Patch("users/:id")
    @UseGuards(JwtHttpGuard, AdminGuard)
    async updateUserRoleAndBlock(
        @Param("id") id: string,
        @Body()
        body: {
            role?: "USER" | "ADMIN";
            isBlocked?: boolean;
        },
    ) {
        const userId = parseInt(id, 10);
        if (!Number.isFinite(userId)) {
            throw new BadRequestException("Invalid user id");
        }

        const { role, isBlocked } = body ?? {};
        return this.adminService.updateUserRoleAndBlock(userId, {
            role,
            isBlocked,
        });
    }
}

