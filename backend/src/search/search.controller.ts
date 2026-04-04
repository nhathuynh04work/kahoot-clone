import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { SearchService } from "./search.service.js";

@Controller("search")
export class SearchController {
    constructor(private searchService: SearchService) {}

    @Get()
    async search(
        @Query("q") q?: string,
        @Query("limit") limit?: string,
    ) {
        const query = (q ?? "").trim();
        if (query.length < 1) {
            throw new BadRequestException("Query must be at least 1 character");
        }

        const n = Number(limit);
        const safeLimit = Number.isFinite(n)
            ? Math.min(10, Math.max(1, Math.floor(n)))
            : 5;

        return this.searchService.searchAll({ q: query, limit: safeLimit });
    }
}

