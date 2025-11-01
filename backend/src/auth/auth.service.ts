import { BadRequestException, Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { UserService } from "../user/user.service.js";
import { UserResponseDto } from "./dto/user-response.dto.js";
import { RegisterUserDto } from "./dto/register-user.dto.js";

@Injectable()
export class AuthService {
    constructor(private userService: UserService) {}

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
}
