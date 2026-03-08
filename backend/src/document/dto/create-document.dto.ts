import { IsInt, IsString, IsOptional, IsEnum } from "class-validator";

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
}
