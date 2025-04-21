import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { UserController } from "./User.controller";
import { UserService } from "./User.service";

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'secretKey',
            signOptions: { expiresIn: '1h' }
        })
    ],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule {}