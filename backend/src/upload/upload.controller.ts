import {
    BadRequestException,
    Body,
    Controller,
    Logger,
    Post,
    UseGuards,
} from "@nestjs/common";
import { UploadService } from "./upload.service";
import { JwtHttpGuard } from "../auth/guard/jwt-http.guard";

@Controller("upload")
export class UploadController {
    private logger = new Logger(UploadController.name);

    constructor(private uploadService: UploadService) {}

    // @UseGuards(JwtHttpGuard)
    @Post("/signature")
    getCloudinaryUploadSignature() {
        try {
            const result = this.uploadService.generateSignature();

            return result;
        } catch (error) {
            this.logger.error(error);

            throw new BadRequestException("Error generating a signature.");
        }
    }
}
