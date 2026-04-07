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

@Controller("admin")
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

    @Get("users/:id")
    @UseGuards(JwtHttpGuard, AdminGuard)
    async getUserDetail(@Param("id") id: string) {
        const userId = parseInt(id, 10);
        if (!Number.isFinite(userId)) throw new BadRequestException("Invalid user id");
        return this.adminService.getUserDetail(userId);
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

    @Get("quizzes")
    @UseGuards(JwtHttpGuard, AdminGuard)
    async getQuizzesPage(
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
            sort === "createdAt_asc"
                ? "createdAt_asc"
                : sort === "saves_desc"
                    ? "saves_desc"
                    : "createdAt_desc";

        return this.adminService.getQuizzesPage({
            page: safePage,
            pageSize: safePageSize,
            q,
            sort: normalizedSort,
        });
    }

    @Get("quizzes/:id")
    @UseGuards(JwtHttpGuard, AdminGuard)
    async getQuizDetail(@Param("id") id: string) {
        const quizId = parseInt(id, 10);
        if (!Number.isFinite(quizId)) throw new BadRequestException("Invalid quiz id");
        return this.adminService.getQuizDetail(quizId);
    }

    @Get("documents")
    @UseGuards(JwtHttpGuard, AdminGuard)
    async getDocumentsPage(
        @Query("page") page?: string,
        @Query("pageSize") pageSize?: string,
        @Query("q") q?: string,
        @Query("status") status?: string,
        @Query("sort") sort?: string,
    ) {
        const parsedPage = page ? parseInt(page, 10) : 1;
        const parsedPageSize = pageSize ? parseInt(pageSize, 10) : 50;

        const safePage = Number.isFinite(parsedPage) ? Math.max(1, parsedPage) : 1;
        const safePageSize = Number.isFinite(parsedPageSize)
            ? Math.min(100, Math.max(1, parsedPageSize))
            : 50;

        const normalizedSort =
            sort === "createdAt_asc"
                ? "createdAt_asc"
                : sort === "saves_desc"
                    ? "saves_desc"
                    : "createdAt_desc";

        const normalizedStatus =
            status === "UPLOADED" || status === "PARSING" || status === "READY" || status === "ERROR"
                ? status
                : undefined;

        return this.adminService.getDocumentsPage({
            page: safePage,
            pageSize: safePageSize,
            q,
            status: normalizedStatus as any,
            sort: normalizedSort,
        });
    }

    @Get("documents/:id")
    @UseGuards(JwtHttpGuard, AdminGuard)
    async getDocumentDetail(@Param("id") id: string) {
        const documentId = parseInt(id, 10);
        if (!Number.isFinite(documentId)) throw new BadRequestException("Invalid document id");
        return this.adminService.getDocumentDetail(documentId);
    }

    @Get("sessions")
    @UseGuards(JwtHttpGuard, AdminGuard)
    async getSessionsPage(
        @Query("page") page?: string,
        @Query("pageSize") pageSize?: string,
        @Query("q") q?: string,
        @Query("status") status?: string,
        @Query("sort") sort?: string,
    ) {
        const parsedPage = page ? parseInt(page, 10) : 1;
        const parsedPageSize = pageSize ? parseInt(pageSize, 10) : 50;

        const safePage = Number.isFinite(parsedPage) ? Math.max(1, parsedPage) : 1;
        const safePageSize = Number.isFinite(parsedPageSize)
            ? Math.min(100, Math.max(1, parsedPageSize))
            : 50;

        const normalizedSort =
            sort === "createdAt_asc"
                ? "createdAt_asc"
                : sort === "endedAt_desc"
                    ? "endedAt_desc"
                    : "createdAt_desc";

        const normalizedStatus =
            status === "CREATED" ||
            status === "WAITING" ||
            status === "IN_PROGRESS" ||
            status === "CLOSED"
                ? status
                : undefined;

        return this.adminService.getSessionsPage({
            page: safePage,
            pageSize: safePageSize,
            q,
            status: normalizedStatus as any,
            sort: normalizedSort,
        });
    }

    @Get("sessions/:id")
    @UseGuards(JwtHttpGuard, AdminGuard)
    async getSessionDetail(@Param("id") id: string) {
        const sessionId = parseInt(id, 10);
        if (!Number.isFinite(sessionId)) throw new BadRequestException("Invalid session id");
        return this.adminService.getSessionDetail(sessionId);
    }

    @Get("revenue")
    @UseGuards(JwtHttpGuard, AdminGuard)
    async getRevenuePage(
        @Query("page") page?: string,
        @Query("pageSize") pageSize?: string,
        @Query("q") q?: string,
    ) {
        const parsedPage = page ? parseInt(page, 10) : 1;
        const parsedPageSize = pageSize ? parseInt(pageSize, 10) : 50;

        const safePage = Number.isFinite(parsedPage) ? Math.max(1, parsedPage) : 1;
        const safePageSize = Number.isFinite(parsedPageSize)
            ? Math.min(100, Math.max(1, parsedPageSize))
            : 50;

        return this.adminService.getRevenuePage({
            page: safePage,
            pageSize: safePageSize,
            q,
        });
    }
}

