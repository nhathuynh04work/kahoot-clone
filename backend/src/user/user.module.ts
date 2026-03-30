import { Module } from "@nestjs/common";
import { UserService } from "./user.service.js";
import { UsersController } from "./user.controller.js";

@Module({
    providers: [UserService],
    controllers: [UsersController],
    exports: [UserService],
})
export class UserModule {}
