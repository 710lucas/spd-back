import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { DocumentService } from "./document.service";
import { PreservationStageEnum } from "src/Enums/PreservationStageEnum";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { existsSync, mkdirSync } from "fs";
import { CreateDocumentType } from "./DTOs/CreateDocumentDTO";
import { Request, Response } from "express";
import axios from "axios";
import { Document } from "./document.model";

@Controller("documents")
export class DocumentController {

    constructor(private readonly documentService: DocumentService) {}

    @Get()
    async getDocuments(@Query('search') search : string) {
        return  (await this.documentService.getDocuments(search) as Document[])
    }

    @Get(":id")
    async getDocumentById(@Param("id") id : string) {
        return await this.documentService.getDocumentById(id);
    }

    @Get("transfer/:id")
    async getTransferById(@Param("id") id : string) {
        return await this.documentService.getTransferData(id);
    }

    @Get('download/:id')
    async downloadDocument(@Param("id") id : string) {
        return await this.documentService.getDocumentURL(id);
    }

    @Get('preview/:id')
    async previewDocument(@Param("id") id : string, @Res() res : Response) {
        const url = await this.documentService.getDocumentURL(id);


        res.setHeader('X-Frame-Options', '');
        res.removeHeader('X-Frame-Options');
        res.setHeader('Content-Disposition', 'inline; filename="preview.pdf"');
        res.setHeader('Content-Type', 'application/pdf');

        res.status(200).json({url})

    }

    @Put(":id")
    updateDocument(@Param("id") id: string, @Body() body: { name?: string; date?: Date; preservationStage?: PreservationStageEnum, metadata?: Map<string, string> }) {
        return this.documentService.updateDocument(id, body.name, body.date ? new Date(body.date) : undefined, body.preservationStage, body.metadata);
    }

    @Delete(":id")
    deleteDocument(@Param("id") id: string) {
        return this.documentService.deleteDocument(id);
    }

    @Post("upload")
    @UseInterceptors(
        FileInterceptor("file", {
            storage : diskStorage({
                destination : (req, file, cb) =>{
                    const folderName = '/upload' + Date.now()
                    const fullPath = (process.env.UPLOAD_DIR || "./uploads") + folderName

                    if (!existsSync(fullPath)) {
                        mkdirSync(fullPath, { recursive: true });
                      }

                    (req as any).folderName = folderName

                    cb(null, fullPath)
                },
                filename : (req, file, cb) => {
                    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
                    const ext = extname(file.originalname);
                    cb(null, Buffer.from(file.originalname, "latin1").toString("utf8") + "-" + uniqueSuffix + ext);
                }
            })
        })
    )
    uploadDocument(@UploadedFile() file: Express.Multer.File, @Body() body : CreateDocumentType, @Req() req : Request) {
        return this.documentService.sendSIP(file.filename, (req as any).folderName, body);
    }

}