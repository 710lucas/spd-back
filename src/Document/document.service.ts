import { Injectable } from "@nestjs/common";
import { Document } from "./document.model";
import { PreservationStageEnum } from "src/Enums/PreservationStageEnum";

@Injectable()
export class DocumentService {

    documents : Document[] = [];
    constructor() {
        this.documents = [
            new Document('1', 'Document 1', new Date(), PreservationStageEnum.INICIADA),
            new Document('2', 'Document 2', new Date(), PreservationStageEnum.PRESERVADO),
            new Document('3', 'Document 3', new Date(), PreservationStageEnum.FALHA)
        ];
    }

    createDocument(name: string, date: Date, preservationStage: string, metadata? : Map<string, string>): Document | string {

        if(metadata && Object.keys(metadata).length > 4) {
            return 'Metadata cannot have more than 4 keys';
        }

        let stage: PreservationStageEnum;
        switch (preservationStage) {
            case 'INICIADA':
                stage = PreservationStageEnum.INICIADA;
                break;
            case 'PRESERVADO':
                stage = PreservationStageEnum.PRESERVADO;
                break;
            case 'FALHA':
                stage = PreservationStageEnum.FALHA;
                break;
            default:
                throw new Error('Invalid preservation stage');
        }
        const newDocument = new Document(
            (this.documents.length + 1).toString(),
            name,
            date,
            stage,
            metadata
        );
        this.documents.push(newDocument);
        return newDocument;
    }

    getDocuments(): Document[] {
        return this.documents;
    }

    getDocumentById(id: string): Document | undefined {
        return this.documents.find(doc => doc.id === id);
    }

    updateDocument(id: string, name?: string, date?: Date, preservationStage?: PreservationStageEnum, metadata? : Map<string, string>): Document | string | undefined {
        const document = this.getDocumentById(id);
        if (document) {
            document.name = name ?? document.name;
            document.date = date ?? document.date;
            document.preservationStage = preservationStage ?? document.preservationStage;
            if(metadata && Object.keys(metadata).length > 4) {
                return "Metadata cannot have more than 4 keys";
            }
            document.metadata = metadata ? metadata : document.metadata;
            return document;
        }
        return undefined;
    }

    //Mudar para delete logico
    deleteDocument(id: string): boolean {
        const index = this.documents.findIndex(doc => doc.id === id);
        if (index !== -1) {
            this.documents.splice(index, 1);
            return true;
        }
        return false;
    }



}