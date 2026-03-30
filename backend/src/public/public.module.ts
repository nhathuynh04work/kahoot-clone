import { Module } from "@nestjs/common";
import { PublicController } from "./public.controller.js";
import { PublicCatalogService } from "./public-catalog.service.js";

@Module({
    controllers: [PublicController],
    providers: [PublicCatalogService],
    exports: [PublicCatalogService],
})
export class PublicModule {}

