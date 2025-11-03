import { IsNumber, IsOptional, IsString, IsUrl } from "class-validator";

export class UpdateQuestionDto {
    @IsOptional()
    @IsString()
    text?: string;

    @IsOptional()
    @IsUrl()
    imageUrl?: string;

    @IsOptional()
    @IsNumber()
    timeLimit?: number;

    @IsOptional()
    @IsNumber()
    sortOrder?: number;

    @IsOptional()
    @IsNumber()
    points?: number;
}
