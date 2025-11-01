import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { RegisterUserDto } from "./dto/register-user.dto.js";

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post("/register")
    register(@Body() data: RegisterUserDto) {
        return this.authService.register(data);
    }
}
