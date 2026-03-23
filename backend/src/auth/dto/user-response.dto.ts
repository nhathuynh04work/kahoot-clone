export class UserResponseDto {
    id: number;
    email: string;
    name: string | null;
    role: "USER" | "ADMIN";
}
