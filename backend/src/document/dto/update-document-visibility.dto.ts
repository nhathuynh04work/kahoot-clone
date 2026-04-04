import { IsIn } from "class-validator";

export class UpdateDocumentVisibilityDto {
    @IsIn(["PUBLIC", "PRIVATE"])
    visibility: "PUBLIC" | "PRIVATE";
}

