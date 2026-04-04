export class UserResponseDto {
    id: number;
    email: string;
    name: string | null;
    avatarUrl?: string | null;
    role: "USER" | "ADMIN";
}
