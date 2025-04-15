import { Injectable } from "@nestjs/common";
import { Document } from "./document.model";
import { PreservationStageEnum } from "src/Enums/PreservationStageEnum";
import axios from "axios";
import { CreateDocumentType } from "./DTOs/CreateDocumentDTO";

@Injectable()
export class DocumentService {

    documents : Document[] = [];
    apiURL : string;
    apiKey : string;
    apiUser : string;

    constructor() {
        this.documents = [
            new Document('1', 'Document 1', new Date(), PreservationStageEnum.INICIADA),
            new Document('2', 'Document 2', new Date(), PreservationStageEnum.PRESERVADO),
            new Document('3', 'Document 3', new Date(), PreservationStageEnum.FALHA)
        ];
        this.apiURL = process.env.AM_API_URL || 'http://10.10.10.20'; 
        this.apiKey = process.env.AM_API_KEY || 'KEY'
        this.apiUser = process.env.AM_API_USER || 'test';

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


    async sendSIP(filename : string, documentData : CreateDocumentType){

        const filePath = process.env.REMOTE_UPLOAD_DIR || './uploads/'
        const locationUUID = process.env.LOCATION_UUID || 'UUID';

        const fullPathEncoded = Buffer.from(`${locationUUID}:${filePath}`).toString('base64');

        const payload = {
            name : filename,
            type : 'standard',
            accession : '',
            paths : [fullPathEncoded],
            row_ids : ['']
        }

        
        const response = await axios.post(
            `${this.apiURL}/api/transfer/start_transfer/`,
            new URLSearchParams({
                'name' : filename.toString(),
                'type' : 'standard',
                'accession' : '',
                'paths[]': fullPathEncoded,
                'row_id[]' : ''
            }),
            {
                headers : {
                    Authorization : `ApiKey ${this.apiKey}`,
                    'Content-Type' : 'application/x-www-form-urlencoded'
                }
            }
        )



        console.log(response.data)
        console.log(filename)

        const pathSplit = response.data.path.split('/')
        console.log(pathSplit[pathSplit.length - 2])

       const newDocument = new Document(
            (this.documents.length + 1).toString(),
            documentData.name,
            new Date(),
            PreservationStageEnum.INICIADA,
            documentData.metadata || new Map<string, string>(),
            (pathSplit[pathSplit.length - 2] as string).replace(filename+"-", "")
        );

        this.documents.push(newDocument);

        return null;

    }

    async getAIPStatus(uuidAIP : string){
        const response = await axios.get(`${this.apiURL}/ingest/status/${uuidAIP}`, {headers : { 'Authorization' : `ApiKey ${this.apiKey}`}});
        return response.data.status

    }


}