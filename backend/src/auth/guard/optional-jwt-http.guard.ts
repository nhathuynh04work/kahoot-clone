import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class OptionalJwtHttpGuard extends AuthGuard("jwt") {
    handleRequest(err: any, user: any) {
        if (err) throw err;
        return user ?? null;
    }
}

