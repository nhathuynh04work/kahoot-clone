import { BadRequestException, Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { UserService } from "../user/user.service.js";
import { UserResponseDto } from "./dto/user-response.dto.js";
import { RegisterUserDto } from "./dto/register-user.dto.js";
import { LoginUserDto } from "./dto/login-user.dto.js";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) {}

    async register(payload: RegisterUserDto): Promise<UserResponseDto> {
        const user = await this.userService.user({
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

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = newUser;
        return result;
    }

    async login(payload: LoginUserDto): Promise<{ accessToken: string }> {
        const user = await this.userService.user({
            email: payload.email,
        });

        if (!user) {
            throw new BadRequestException("Invalid email or password");
        }

        const isValid = await bcrypt.compare(payload.password, user.password);

        if (!isValid) {
            throw new BadRequestException("Invalid email or password");
        }

        const jwtPayload = {
            sub: user.id,
            email: user.email,
        };

        const token = await this.jwtService.signAsync(jwtPayload);
        return { accessToken: token };
    }
}
