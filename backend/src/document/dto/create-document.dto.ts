import { IsInt, IsString, IsOptional } from "class-validator";

export class CreateDocumentDto {
    @IsString()
    fileName: string;

    @IsString()
    fileUrl: string;

    @IsInt()
    fileSize: number;

    @IsOptional()
    @IsString()
    mimeType?: string;

    @IsOptional()
    @IsString()
    cloudinaryPublicId?: string;
}
