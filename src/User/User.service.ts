import { Injectable } from "@nestjs/common";
import { UserRepository } from "./User.repository";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class UserService {
    apiURL: string;
    apiKey: string;
    apiUser: string;
    userRepository: UserRepository;
    jwtService: JwtService;

    constructor() {
        this.apiURL = process.env.AM_API_URL || 'http://localhost:3000';
        this.apiKey = process.env.AM_API_KEY || 'KEY';
        this.apiUser = process.env.AM_API_USER || 'test';
        this.userRepository = new UserRepository();
        this.jwtService = new JwtService();

    }

    async saveUser(user: any): Promise<any> {
        return await this.userRepository.saveUser(user);
    }

    async getAllUsers(): Promise<any[]> {
        return await this.userRepository.getAllUsers();
    }

    async getUserById(id: string): Promise<any> {
        return await this.userRepository.getUserById(id);
    }

    async createUser(name: string, password: string): Promise<any> {

        const newUser = {
            username: name,
            password
        };

        return await this.userRepository.saveUser(newUser);
    }

    async validateUser(username : string, password: string): Promise<any> {
        const user = await this.userRepository.getUserByUsername(username);

        if (!user) {
            throw new Error('User not found');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }

        return user;
    }


    async login(username: string, password: string): Promise<any> {

        const user = await this.validateUser(username, password);
        const token = await this.jwtService.sign(user);
        return {
            access_token: token,
            user: {
                id: user.id,
                name: user.name
            },
        };

    }
}
