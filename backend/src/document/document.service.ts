import { Injectable, ForbiddenException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary } from "cloudinary";
import { Prisma, DocumentStatus } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDocumentDto } from "./dto/create-document.dto";

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
        return this.prisma.$transaction(async (tx) => {
            await tx.$executeRaw`SELECT 1 FROM "User" WHERE id = ${userId} FOR UPDATE`;
            const result = await tx.document.aggregate({
                where: { userId },
                _sum: { fileSize: true },
            });
            const totalSize = result._sum.fileSize ?? 0;
            if (totalSize + dto.fileSize > this.MAX_TOTAL_SIZE_BYTES) {
                throw new ForbiddenException(
                    `Total storage limit exceeded. You have ${this.formatSize(totalSize)} used. Maximum allowed is ${this.formatSize(this.MAX_TOTAL_SIZE_BYTES)}.`,
                );
            }
            return tx.document.create({
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
        });
    }

    async findAll(
        userId: number,
        options?: {
            q?: string;
            sort?: string;
        },
    ) {
        const q = options?.q?.trim();
        const sort = options?.sort?.trim();

        const where: Prisma.DocumentWhereInput = {
            userId,
            ...(q
                ? {
                      fileName: { contains: q, mode: "insensitive" },
                  }
                : {}),
        };

        const orderBy: Prisma.DocumentOrderByWithRelationInput[] = (() => {
            switch (sort) {
                case "createdAt_asc":
                    return [{ createdAt: "asc" }, { id: "asc" }];
                case "createdAt_desc":
                    return [{ createdAt: "desc" }, { id: "desc" }];
                case "name_asc":
                    return [{ fileName: "asc" }, { id: "desc" }];
                case "name_desc":
                    return [{ fileName: "desc" }, { id: "desc" }];
                case "size_asc":
                    return [{ fileSize: "asc" }, { id: "desc" }];
                case "size_desc":
                    return [{ fileSize: "desc" }, { id: "desc" }];
                default:
                    return [{ createdAt: "desc" }];
            }
        })();

        const docs = await this.prisma.document.findMany({
            where,
            orderBy,
            include: { user: { select: { name: true, email: true } } },
        });

        return docs.map((doc) => {
            const authorName = doc.user?.name ?? doc.user?.email ?? null;
            const { user: _user, ...rest } = doc;
            return { ...rest, authorName };
        });
    }

    async findPage(
        userId: number,
        options: {
            q?: string;
            sort?: string;
            page: number;
            pageSize: number;
        },
    ) {
        const q = options.q?.trim();
        const sort = options.sort?.trim();
        const page = Math.max(1, options.page);
        const pageSize = Math.min(200, Math.max(1, options.pageSize));

        const where: Prisma.DocumentWhereInput = {
            userId,
            ...(q
                ? {
                      fileName: { contains: q, mode: "insensitive" },
                  }
                : {}),
        };

        const orderBy: Prisma.DocumentOrderByWithRelationInput[] = (() => {
            switch (sort) {
                case "createdAt_asc":
                    return [{ createdAt: "asc" }, { id: "asc" }];
                case "createdAt_desc":
                    return [{ createdAt: "desc" }, { id: "desc" }];
                case "name_asc":
                    return [{ fileName: "asc" }, { id: "desc" }];
                case "name_desc":
                    return [{ fileName: "desc" }, { id: "desc" }];
                case "size_asc":
                    return [{ fileSize: "asc" }, { id: "desc" }];
                case "size_desc":
                    return [{ fileSize: "desc" }, { id: "desc" }];
                default:
                    return [{ createdAt: "desc" }, { id: "desc" }];
            }
        })();

        const totalItems = await this.prisma.document.count({ where });
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const safePage = Math.min(page, totalPages);
        const skip = (safePage - 1) * pageSize;

        const docs = await this.prisma.document.findMany({
            where,
            orderBy,
            skip,
            take: pageSize,
            include: { user: { select: { name: true, email: true } } },
        });

        const items = docs.map((doc) => {
            const authorName = doc.user?.name ?? doc.user?.email ?? null;
            const { user: _user, ...rest } = doc;
            return { ...rest, authorName };
        });

        return { items, page: safePage, pageSize, totalItems, totalPages };
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

    async updateVisibility(
        id: number,
        userId: number,
        visibility: "PUBLIC" | "PRIVATE",
    ) {
        const doc = await this.prisma.document.findUnique({
            where: { id },
        });
        if (!doc || doc.userId !== userId) {
            throw new ForbiddenException("Document not found");
        }

        return this.prisma.document.update({
            where: { id },
            data: { visibility },
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
