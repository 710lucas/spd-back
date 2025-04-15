import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { DocumentController } from './Document/document.controller';
import { DocumentService } from './Document/document.service';

@Module({
  imports: [
    ConfigModule.forRoot()
  ],
  controllers: [AppController, DocumentController],
  providers: [AppService, DocumentService],
})
export class AppModule {}
