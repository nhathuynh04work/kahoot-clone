import { Body, Controller, Logger, Post, UseGuards } from "@nestjs/common";
import { AiService } from "./ai.service";
import type { JwtUser } from "../auth/user.decorator";
import { User } from "../auth/user.decorator";
import { JwtHttpGuard } from "../auth/guard/jwt-http.guard";
import { GenerateQuestionsDto } from "./dto/generate-questions.dto";

@Controller("ai")
@UseGuards(JwtHttpGuard)
export class AiController {
    private readonly logger = new Logger(AiController.name);

    constructor(private readonly aiService: AiService) {}

    @Post("generate-questions")
    async generateQuestions(
        @Body() dto: GenerateQuestionsDto,
        @User() user: JwtUser,
    ) {
        this.logger.log(
            JSON.stringify({
                event: "ai.generateQuestions.http_request",
                userId: user.id,
                hasDocumentId: dto.documentId != null,
            }),
        );

        return this.aiService.generateQuestions(
            user.id,
            dto.prompt,
            dto.documentId,
        );
    }
}
