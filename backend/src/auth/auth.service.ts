import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { UserService } from "../user/user.service.js";
import { UserResponseDto } from "./dto/user-response.dto.js";
import { RegisterUserDto } from "./dto/register-user.dto.js";
import { LoginUserDto } from "./dto/login-user.dto.js";
import { JwtService } from "@nestjs/jwt";
import { JwtPayloadDto } from "./dto/jwt-payload.dto";
import { UpdateMeDto } from "./dto/update-me.dto";
import { EntitlementService } from "../entitlements/entitlement.service.js";

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private entitlementService: EntitlementService,
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

        const userWithRole = await this.userService.getUserWithRole({ id: newUser.id });
        if (!userWithRole) throw new BadRequestException("User not found after creation");

        return {
            id: userWithRole.id,
            email: userWithRole.email,
            name: userWithRole.name,
            avatarUrl: (userWithRole as any).avatarUrl ?? null,
            role: userWithRole.role ?? "USER",
        };
    }

    async login(payload: LoginUserDto): Promise<string> {
        const user = await this.userService.getUser({
            email: payload.email,
        });

        if (!user) {
            throw new BadRequestException("Invalid email or password");
        }

        if ((user as any).isBlocked) {
            throw new UnauthorizedException("Account blocked");
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

    async loginAdmin(payload: LoginUserDto): Promise<string> {
        const user = await this.userService.getUserWithRole({
            email: payload.email,
        });

        if (!user) {
            throw new BadRequestException("Invalid email or password");
        }

        if ((user as any).isBlocked) {
            throw new UnauthorizedException("Account blocked");
        }

        const isValid = await bcrypt.compare(payload.password, user.password);
        if (!isValid) {
            throw new BadRequestException("Invalid email or password");
        }

        if (user.role !== "ADMIN") {
            throw new BadRequestException("Admin access required");
        }

        const jwtPayload: JwtPayloadDto = {
            sub: user.id,
            email: user.email,
        };

        return this.jwtService.signAsync(jwtPayload);
    }

    async getProfile(id: number) {
        const user = await this.userService.getUserWithRole({ id });

        if (!user) {
            throw new BadRequestException("User not found");
        }

        const vip = await this.entitlementService.getVipStatus(id);
        const limits = this.entitlementService.getLimitsForVip(vip.isVip);

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: (user as any).avatarUrl ?? null,
            role: user.role ?? "USER",
            vip: {
                isVip: vip.isVip,
                source: vip.source,
                currentPeriodEnd: vip.currentPeriodEnd?.toISOString() ?? null,
                cancelAtPeriodEnd: vip.cancelAtPeriodEnd ?? false,
            },
            limits: {
                maxQuestionsPerQuiz: limits.maxQuestionsPerQuiz,
                maxDocuments: limits.maxDocuments,
                maxTotalStorageBytes: limits.maxTotalStorageBytes,
                canUseShortAnswerAndRange: limits.canUseShortAnswerAndRange,
            },
        };
    }

    async updateProfile(id: number, dto: UpdateMeDto) {
        const user = await this.userService.getUserWithRole({ id });
        if (!user) {
            throw new BadRequestException("User not found");
        }
        if ((user as any).isBlocked) {
            throw new UnauthorizedException("Account blocked");
        }

        if (dto.name === undefined && dto.avatarUrl === undefined) return this.getProfile(id);

        const updated = await this.userService.update(id, {
            ...(dto.name !== undefined ? { name: dto.name } : {}),
            ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl } : {}),
        });

        return this.getProfile(updated.id);
    }
}
