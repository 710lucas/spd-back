import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { DocumentService } from "./document.service";
import { PreservationStageEnum } from "src/Enums/PreservationStageEnum";

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

}