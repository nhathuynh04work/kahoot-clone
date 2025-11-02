import { IsOptional, IsString, IsUrl } from "class-validator";

export class UpdateQuizDto {
    @IsOptional()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsUrl()
    coverUrl?: string;
}
