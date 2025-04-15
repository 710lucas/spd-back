import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseInterceptors } from "@nestjs/common";
import { DocumentService } from "./document.service";
import { PreservationStageEnum } from "src/Enums/PreservationStageEnum";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { existsSync, mkdirSync } from "fs";
import { CreateDocumentType } from "./DTOs/CreateDocumentDTO";

@Controller("documents")
export class DocumentController {

    constructor(private readonly documentService: DocumentService) {}

    @Post()
    createDocument(@Body() body: { name: string; date: Date; preservationStage: string, metadata?: Map<string, string> }) {
        return this.documentService.createDocument(body.name, new Date(body.date), body.preservationStage, body.metadata);
    }

    @Get()
    getDocuments() {
        return this.documentService.getDocuments();
    }

    @Get(":id")
    getDocumentById(@Param("id") id : string) {
        return this.documentService.getDocumentById(id);
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
                    const fullPath = (process.env.UPLOAD_DIR || "./uploads") + "/upload" + Date.now()

                    if (!existsSync(fullPath)) {
                        mkdirSync(fullPath, { recursive: true });
                      }

                    cb(null, fullPath)
                },
                filename : (req, file, cb) => {


                    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
                    const ext = extname(file.originalname);
                    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
                }
            })
        })
    )
    uploadDocument(@UploadedFile() file: Express.Multer.File, @Body() body : CreateDocumentType) {
        return this.documentService.sendSIP(file.filename, body);
    }

}