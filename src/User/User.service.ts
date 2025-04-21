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
        this.jwtService = new JwtService({privateKey: process.env.JWT_SECRET || 'secretKey'});

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

    async getUserByUsername(username: string) : Promise<any> {
        return await this.userRepository.getUserByUsername(username);
    }

    async createUser(name: string, password: string): Promise<any> {

        if(name.trim().length === 0 || password.trim().length === 0) {
            throw new Error('Username and password cannot be empty');
        }

        const existingUser = await this.userRepository.getUserByUsername(name);
        if (existingUser) {
            throw new Error('Username already exists');
        }

        const newUser = {
            username: name,
            password: bcrypt.hashSync(password, 10)
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
        console.log('user', user)
        const token = await this.jwtService.sign(user);
        return {
            access_token: token,
            user: {
                id: user.id,
                username: user.username
            },
        };

    }
}
