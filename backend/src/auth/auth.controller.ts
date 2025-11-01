import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { RegisterUserDto } from "./dto/register-user.dto.js";
import { LoginUserDto } from "./dto/login-user.dto.js";
import { UserResponseDto } from "./dto/user-response.dto.js";

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post("/register")
    register(@Body() data: RegisterUserDto): Promise<UserResponseDto> {
        return this.authService.register(data);
    }

    @Post("/login")
    login(@Body() data: LoginUserDto): Promise<{ accessToken: string }> {
        return this.authService.login(data);
    }
}
