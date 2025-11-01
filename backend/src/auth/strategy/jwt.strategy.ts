import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { JwtPayloadDto } from "../dto/jwt-payload.dto.js";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                JwtStrategy.extractJWTFromCookie,
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>("JWT_SECRET") || "",
        });
    }

    private static extractJWTFromCookie(
        this: void,
        req: Request,
    ): string | null {
        const token: string = req.cookies.access_token;
        return token;
    }

    validate(payload: JwtPayloadDto) {
        return { id: payload.sub, email: payload.email };
    }
}
