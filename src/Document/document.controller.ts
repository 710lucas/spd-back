import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Request, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { DocumentService } from "./document.service";
import { PreservationStageEnum } from "src/Enums/PreservationStageEnum";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { existsSync, mkdirSync } from "fs";
import { CreateDocumentType } from "./DTOs/CreateDocumentDTO";
import { Response } from "express";
import { Document } from "./document.model";
import { UserGuard } from "src/User/User.guard";

@Controller("documents")
export class DocumentController {

    constructor(private readonly documentService: DocumentService) {}

    @Get()
    @UseGuards(UserGuard)
    async getDocuments(@Query('search') search : string, @Request() req) {
        return  (await this.documentService.getDocuments(search, req.user) as Document[])
    }

    @Get(":id")
    @UseGuards(UserGuard)
    async getDocumentById(@Param("id") id : string, @Request() req) {
        return await this.documentService.getDocumentById(id, req.user);
    }

    @Get("transfer/:id")
    @UseGuards(UserGuard)
    async getTransferById(@Param("id") id : string, @Request() req) {
        return await this.documentService.getTransferData(id, req.user);
    }

    @Get('download/:id')
    @UseGuards(UserGuard)
    async downloadDocument(@Param("id") id : string, @Request() req) {
        return await this.documentService.getDocumentURL(id, req.user);
    }

    @Get('preview/:id')
    @UseGuards(UserGuard)
    async previewDocument(@Param("id") id : string, @Res() res : Response, @Request() req) {
        const url = await this.documentService.getDocumentURL(id, req.user);


        res.setHeader('X-Frame-Options', '');
        res.removeHeader('X-Frame-Options');
        res.setHeader('Content-Disposition', 'inline; filename="preview.pdf"');
        res.setHeader('Content-Type', 'application/pdf');

        res.status(200).json({url})

    }

    @Put(":id")
    @UseGuards(UserGuard)
    updateDocument(@Param("id") id: string, @Request() req , @Body() body: { name?: string; date?: Date; preservationStage?: PreservationStageEnum, metadata?: Map<string, string> }) {
        return this.documentService.updateDocument(id, req.user, body.name, body.date ? new Date(body.date) : undefined, body.preservationStage, body.metadata);
    }

    @Delete(":id")
    @UseGuards(UserGuard)
    deleteDocument(@Param("id") id: string, @Request() req) {
        return this.documentService.deleteDocument(id, req.user);
    }

    @Post("upload")
    @UseGuards(UserGuard)
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
    uploadDocument(@UploadedFile() file: Express.Multer.File, @Body() body : CreateDocumentType, @Req() req) {
        return this.documentService.sendSIP(file.filename, (req as any).folderName, body, req.user);
    }

}