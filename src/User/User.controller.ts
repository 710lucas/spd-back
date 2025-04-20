import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "./User.service";

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Post('login')
    async login(@Body() body : { username: string, password: string }) {
        const { username, password } = body;
        return await this.userService.login(username, password);
    }

}
