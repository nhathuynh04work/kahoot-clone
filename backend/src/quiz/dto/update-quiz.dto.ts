import { Type } from "class-transformer";
import {
    IsArray,
    IsEnum,
    IsIn,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    IsUrl,
    ValidateNested,
} from "class-validator";
import { QuestionType } from "../../generated/prisma/client.js";

export class UpdateQuestionDto {
    @IsOptional()
    @IsNumber()
    id?: number;

    @IsOptional()
    @IsString()
    text?: string;

    @IsOptional()
    @IsNumber()
    timeLimit?: number;

    @IsOptional()
    @IsNumber()
    points?: number;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsNumber()
    sortOrder?: number;

    @IsOptional()
    @IsEnum(QuestionType)
    type?: QuestionType;

    /** Type-specific JSON (MC/TF/SA/NR — see question-payload.ts). */
    @IsOptional()
    @IsObject()
    data?: Record<string, unknown>;
}

export class UpdateQuizDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsUrl()
    coverUrl?: string;

    @IsOptional()
    @IsIn(["PUBLIC", "PRIVATE"])
    visibility?: "PUBLIC" | "PRIVATE";

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateQuestionDto)
    questions?: UpdateQuestionDto[];
}
