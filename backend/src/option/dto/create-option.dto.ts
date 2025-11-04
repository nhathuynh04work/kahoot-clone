import { IsString } from "class-validator";

export class CreateOptionDto {
    @IsString()
    text: string;
}
