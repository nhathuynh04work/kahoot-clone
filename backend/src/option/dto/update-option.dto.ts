import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateOptionDto {
    @IsOptional()
    @IsString()
    text: string;

    @IsOptional()
    @IsBoolean()
    isCorrect: boolean;
}
