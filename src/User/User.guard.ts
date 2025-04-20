import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { UserService } from "./User.service";

@Injectable()
export class UserGuard implements CanActivate {

    constructor(private userService : UserService){}


    async canActivate(context : ExecutionContext) : Promise<boolean>{
        const req = context.switchToHttp().getRequest();
        const authHeader : string = req.headers.Authorization  || req.headers.authorization;

        if(!authHeader.startsWith('Bearer ')){
            return false;
        }

        const token = authHeader.split(' ')[1];
        const user = await this.userService.validateUser(token, token);
        req.user = user;
        return true;

    }

}
