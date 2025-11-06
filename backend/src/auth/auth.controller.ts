import { Body, Controller, Get, Post, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { RegisterUserDto } from "./dto/register-user.dto.js";
import { LoginUserDto } from "./dto/login-user.dto.js";
import { UserResponseDto } from "./dto/user-response.dto.js";
import { type JwtUser, User } from "./user.decorator.js";
import { type Response } from "express";
import { JwtHttpGuard } from "./guard/jwt-http.guard.js";

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post("/register")
    register(@Body() data: RegisterUserDto): Promise<UserResponseDto> {
        return this.authService.register(data);
    }

    @Post("/login")
    async login(
        @Body() data: LoginUserDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const jwt = await this.authService.login(data);

        res.cookie("access_token", jwt, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        });

        return { success: true };
    }

    @UseGuards(JwtHttpGuard)
    @Get("/me")
    getProfile(@User() user: JwtUser) {
        return this.authService.getProfile(user.id);
    }
}
