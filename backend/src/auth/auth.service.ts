import { BadRequestException, Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { UserService } from "../user/user.service.js";
import { UserResponseDto } from "./dto/user-response.dto.js";
import { RegisterUserDto } from "./dto/register-user.dto.js";
import { LoginUserDto } from "./dto/login-user.dto.js";
import { JwtService } from "@nestjs/jwt";
import { JwtPayloadDto } from "./dto/jwt-payload.dto.js";

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) {}

    async register(payload: RegisterUserDto): Promise<UserResponseDto> {
        const user = await this.userService.getUser({
            email: payload.email,
        });

        if (user) {
            throw new BadRequestException("This email is already registered");
        }

        const hash = await bcrypt.hash(payload.password, 10);

        const newUser = await this.userService.create({
            ...payload,
            password: hash,
        });

        const { password, ...result } = newUser;
        return result;
    }

    async login(payload: LoginUserDto): Promise<string> {
        const user = await this.userService.getUser({
            email: payload.email,
        });

        if (!user) {
            throw new BadRequestException("Invalid email or password");
        }

        const isValid = await bcrypt.compare(payload.password, user.password);

        if (!isValid) {
            throw new BadRequestException("Invalid email or password");
        }

        const jwtPayload: JwtPayloadDto = {
            sub: user.id,
            email: user.email,
        };

        return this.jwtService.signAsync(jwtPayload);
    }

    async getProfile(id: number) {
        const user = await this.userService.getUser({ id });

        if (!user) {
            throw new BadRequestException("User not found");
        }

        const { password, ...result } = user;
        return result;
    }
}
