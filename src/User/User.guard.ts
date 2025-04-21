import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "./User.service";
import { User } from "@prisma/client";

@Injectable()
export class UserGuard implements CanActivate {

    constructor(private userService : UserService){}


    async canActivate(context : ExecutionContext) : Promise<boolean>{
        const req = context.switchToHttp().getRequest();
        const authHeader : string = req.headers.Authorization  || req.headers.authorization;

        if(!authHeader){
            throw new UnauthorizedException('Authorization header is missing');
        }

        if(!authHeader.startsWith('Bearer ')){
            throw new UnauthorizedException('Invalid token format. Expected "Bearer <token>"');
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = this.userService.jwtService.decode(token) as { username: string, exp: number };
        // const user = await this.userService.validateUser(token, token);
        const user = await this.userService.getUserByUsername(decodedToken.username);
        req.user = user as User;
        return true;

    }

}
