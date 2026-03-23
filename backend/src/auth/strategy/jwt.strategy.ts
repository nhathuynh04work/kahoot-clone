import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { JwtPayloadDto } from "../dto/jwt-payload.dto.js";
import { UserService } from "../../user/user.service.js";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService, private userService: UserService) {
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

    async validate(payload: JwtPayloadDto) {
        const user = await this.userService.getUserWithRole({ id: payload.sub });

        if (!user || (user as any).isBlocked) {
            throw new UnauthorizedException("Account blocked");
        }

        return { id: user.id, email: user.email };
    }
}
