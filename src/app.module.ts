import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { DocumentController } from './Document/document.controller';
import { DocumentService } from './Document/document.service';
import { UserModule } from './User/User.module';
import { UserController } from './User/User.controller';
import { UserService } from './User/User.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    JwtModule.register({
        secret: process.env.JWT_SECRET || 'secretKey',
        signOptions: { expiresIn: '1h' }
    })
  ],
  controllers: [AppController, DocumentController, UserController],
  providers: [AppService, DocumentService, UserService],
})
export class AppModule {}
