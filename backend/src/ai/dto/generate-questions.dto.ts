import { IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class GenerateQuestionsDto {
    @IsString()
    @MinLength(1, { message: "Prompt is required" })
    prompt: string;

    @IsOptional()
    @IsNumber()
    documentId?: number;
}
