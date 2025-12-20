import { ConfigService } from "@nestjs/config";
import { BadRequestException, Controller, Injectable } from "@nestjs/common";
import { v2 as cloudinary } from "cloudinary";

@Injectable()
export class UploadService {
    constructor(private configService: ConfigService) {}

    generateSignature() {
        const apiSecret = this.configService.get<string>(
            "CLOUDINARY_API_SECRET",
        );

        if (!apiSecret) {
            throw new BadRequestException("Cannot find Cloudinary API secret");
        }

        const timestamp = Math.round(new Date().getTime() / 1000);

        const params = {
            timestamp: timestamp,
            folder: "kahoot-clone-uploads",
        };

        const signature = cloudinary.utils.api_sign_request(params, apiSecret);

        return {
            ...params,
            signature,
            apiKey: this.configService.get<string>("CLOUDINARY_API_KEY"),
            cloudName: this.configService.get<string>("CLOUDINARY_CLOUD_NAME"),
        };
    }
}
