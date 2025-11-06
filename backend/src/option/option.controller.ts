import {
    Body,
    Controller,
    Delete,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from "@nestjs/common";
import { OptionService } from "./option.service.js";
import { JwtHttpGuard } from "../auth/guard/jwt-http.guard.js";
import { type JwtUser, User } from "../auth/user.decorator.js";
import { CreateOptionDto } from "./dto/create-option.dto.js";
import { UpdateOptionDto } from "./dto/update-option.dto.js";

@UseGuards(JwtHttpGuard)
@Controller("quiz/:quizId/questions/:questionId/options")
export class OptionController {
    constructor(private optionService: OptionService) {}

    @Post()
    create(
        @User() user: JwtUser,
        @Param("quizId", ParseIntPipe) quizId: number,
        @Param("questionId", ParseIntPipe) questionId: number,
        @Body() payload: CreateOptionDto,
    ) {
        return this.optionService.create({
            quizId,
            questionId,
            userId: user.id,
            payload,
        });
    }

    @Patch("/:optionId")
    update(
        @User() user: JwtUser,
        @Param("quizId", ParseIntPipe) quizId: number,
        @Param("questionId", ParseIntPipe) questionId: number,
        @Param("optionId", ParseIntPipe) optionId: number,
        @Body() payload: UpdateOptionDto,
    ) {
        return this.optionService.update({
            quizId,
            questionId,
            optionId,
            userId: user.id,
            payload,
        });
    }

    @Delete("/:optionId")
    async delete(
        @User() user: JwtUser,
        @Param("quizId", ParseIntPipe) quizId: number,
        @Param("questionId", ParseIntPipe) questionId: number,
        @Param("optionId", ParseIntPipe) optionId: number,
    ) {
        await this.optionService.delete({
            quizId,
            questionId,
            optionId,
            userId: user.id,
        });

        return { success: true };
    }
}
