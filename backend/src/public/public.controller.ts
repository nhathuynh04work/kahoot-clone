import { Controller, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import { PublicCatalogService } from "./public-catalog.service";

@Controller("public")
export class PublicController {
    constructor(private catalog: PublicCatalogService) {}

    @Get("quizzes")
    getPublicQuizzes(
        @Query("mode") mode: string = "recent",
        @Query("page") page?: string,
        @Query("pageSize") pageSize?: string,
    ) {
        return this.catalog.getPublicQuizzes({
            mode,
            page: page ? parseInt(page, 10) : 1,
            pageSize: pageSize ? parseInt(pageSize, 10) : 20,
        });
    }

    @Get("quizzes/:quizId")
    getPublicQuizDetails(
        @Param("quizId", ParseIntPipe) quizId: number,
    ) {
        return this.catalog.getPublicQuizDetails(quizId);
    }

    @Get("users/:userId/quizzes")
    getPublicUserQuizzes(
        @Param("userId", ParseIntPipe) userId: number,
        @Query("mode") mode: string = "recent",
        @Query("page") page?: string,
        @Query("pageSize") pageSize?: string,
    ) {
        return this.catalog.getPublicQuizzesByUserId(userId, {
            mode,
            page: page ? parseInt(page, 10) : 1,
            pageSize: pageSize ? parseInt(pageSize, 10) : 20,
        });
    }

    @Get("documents")
    getPublicDocuments(
        @Query("mode") mode: string = "recent",
        @Query("page") page?: string,
        @Query("pageSize") pageSize?: string,
    ) {
        return this.catalog.getPublicDocuments({
            mode,
            page: page ? parseInt(page, 10) : 1,
            pageSize: pageSize ? parseInt(pageSize, 10) : 20,
        });
    }

    @Get("users/:userId/documents")
    getPublicUserDocuments(
        @Param("userId", ParseIntPipe) userId: number,
        @Query("mode") mode: string = "recent",
        @Query("page") page?: string,
        @Query("pageSize") pageSize?: string,
    ) {
        return this.catalog.getPublicDocumentsByUserId(userId, {
            mode,
            page: page ? parseInt(page, 10) : 1,
            pageSize: pageSize ? parseInt(pageSize, 10) : 20,
        });
    }
}

