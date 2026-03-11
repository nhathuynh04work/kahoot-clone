import { Injectable, ForbiddenException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary } from "cloudinary";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDocumentDto } from "./dto/create-document.dto";
import { DocumentStatus } from "../generated/prisma/client";

@Injectable()
export class DocumentService {
    private readonly logger = new Logger(DocumentService.name);
    private readonly MAX_TOTAL_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

    constructor(
        private prisma: PrismaService,
        private config: ConfigService,
    ) {
        cloudinary.config({
            cloud_name: this.config.get<string>("CLOUDINARY_CLOUD_NAME"),
            api_key: this.config.get<string>("CLOUDINARY_API_KEY"),
            api_secret: this.config.get<string>("CLOUDINARY_API_SECRET"),
        });
    }

    async create(userId: number, dto: CreateDocumentDto) {
        const totalSize = await this.getTotalSize(userId);
        if (totalSize + dto.fileSize > this.MAX_TOTAL_SIZE_BYTES) {
            throw new ForbiddenException(
                `Total storage limit exceeded. You have ${this.formatSize(totalSize)} used. Maximum allowed is ${this.formatSize(this.MAX_TOTAL_SIZE_BYTES)}.`,
            );
        }

        return this.prisma.document.create({
            data: {
                userId,
                fileName: dto.fileName,
                fileUrl: dto.fileUrl,
                fileSize: dto.fileSize,
                mimeType: dto.mimeType ?? "application/pdf",
                cloudinaryPublicId: dto.cloudinaryPublicId,
                status: DocumentStatus.UPLOADED,
            },
        });
    }

    async findAll(userId: number) {
        return this.prisma.document.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }

    async findOne(id: number, userId: number) {
        const doc = await this.prisma.document.findUnique({
            where: { id },
        });
        if (!doc || doc.userId !== userId) {
            return null;
        }
        return doc;
    }

    async delete(id: number, userId: number) {
        const doc = await this.prisma.document.findUnique({
            where: { id },
        });
        if (!doc || doc.userId !== userId) {
            throw new ForbiddenException("Document not found");
        }

        if (doc.cloudinaryPublicId) {
            await this.deleteFromCloudinary(doc.cloudinaryPublicId);
        }

        await this.prisma.document.delete({ where: { id } });
        return { success: true };
    }

    private async deleteFromCloudinary(publicId: string): Promise<void> {
        try {
            const result = await cloudinary.uploader.destroy(publicId, {
                resource_type: "raw",
            });
            if (result.result === "ok") {
                this.logger.log(`Deleted Cloudinary raw asset: ${publicId}`);
            } else {
                this.logger.warn(`Cloudinary delete returned ${result.result} for ${publicId}`);
            }
        } catch (err) {
            this.logger.warn(
                `Failed to delete Cloudinary asset ${publicId}: ${err instanceof Error ? err.message : String(err)}`,
            );
        }
    }

    async updateStatus(
        id: number,
        userId: number,
        status: DocumentStatus,
    ) {
        const doc = await this.prisma.document.findUnique({
            where: { id },
        });
        if (!doc || doc.userId !== userId) {
            throw new ForbiddenException("Document not found");
        }
        return this.prisma.document.update({
            where: { id },
            data: { status },
        });
    }

    async getTotalSize(userId: number): Promise<number> {
        const result = await this.prisma.document.aggregate({
            where: { userId },
            _sum: { fileSize: true },
        });
        return result._sum.fileSize ?? 0;
    }

    private formatSize(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
}
