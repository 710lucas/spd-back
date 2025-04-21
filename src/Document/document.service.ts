import { Injectable } from "@nestjs/common";
import { Document } from "./document.model";
import { PreservationStageEnum } from "src/Enums/PreservationStageEnum";
import { CreateDocumentType } from "./DTOs/CreateDocumentDTO";
import { http } from "src/axiosConfig/http";
import { DocumentRepository } from "./document.repository";
import { Prisma, User } from "@prisma/client";

@Injectable()
export class DocumentService {

    apiURL : string;
    storageServiceURL : string;
    apiKey : string;
    apiUser : string;
    documentRepository : DocumentRepository;

    constructor() {
       
        this.apiURL = process.env.AM_API_URL || 'http://10.10.10.20'; 
        this.apiKey = process.env.AM_API_KEY || 'KEY'
        this.apiUser = process.env.AM_API_USER || 'test';
        this.storageServiceURL = process.env.AM_STORAGE_SERV_URL || 'http://10.10.10.20:8000';
        this.documentRepository = new DocumentRepository();

    }

    async saveDocument(document: Prisma.DocumentCreateInput): Promise<any> {
        return await this.documentRepository.saveDocument(document);
    }

    // async createDocument(name: string, date: Date, preservationStage: string, metadata? : Map<string, string>): Promise<any | string> {

    //     const documents = await this.documentRepository.getAllDocuments();

    //     if(metadata && Object.keys(metadata).length > 4) {
    //         return 'Metadata cannot have more than 4 keys';
    //     }

    //     let stage: PreservationStageEnum;
    //     switch (preservationStage) {
    //         case 'INICIADA':
    //             stage = PreservationStageEnum.INICIADA;
    //             break;
    //         case 'PRESERVADO':
    //             stage = PreservationStageEnum.PRESERVADO;
    //             break;
    //         case 'FALHA':
    //             stage = PreservationStageEnum.FALHA;
    //             break;
    //         default:
    //             throw new Error('Invalid preservation stage');
    //     }
    //     const newDocument = {
    //         (documents.length + 1).toString(),
    //         name,
    //         date,
    //         stage,
    //         metadata
    //     }

    //     await this.saveDocument(newDocument);

    //     return newDocument;
    // }

    async getDocuments(search : string, user : User): Promise<any[]> {

        let documents = await this.documentRepository.getAllDocumentsByUserId(user.id);

        try{

            documents.forEach(async (document) => {
                await this.getTransferData(document.id, user)
                if(document.SIPuuid === '' || document.SIPuuid === undefined) {
                    await this.getTransferData(document.id, user)
                }
            })
            documents = await this.documentRepository.getAllDocumentsByUserId(user.id);

            if(search) {
                return documents.filter(doc => {
                    const newMetadata = doc.metadata as Record<string, string>; 
                    return Object.values(newMetadata).some(value => value.toLowerCase().includes(search.toLowerCase()));
                });
            }

            return documents
        } catch (error) {
            console.error('Error getting documents:', error);
            return [];
        }
        
    }

    async getDocumentById(id: string, user : User): Promise<any | undefined>{
        const document = await this.documentRepository.getDocumentById(id);
        if(!document || document.ownerId !== user.id) {
            return undefined;
        }
        return document
    }

    async updateDocument(id: string, user : User, name?: string, date?: Date, preservationStage?: PreservationStageEnum, metadata? : Map<string, string>): Promise<Document | string | undefined>{
        const document = await this.getDocumentById(id, user);
        if (document) {
            document.name = name ?? document.name;
            document.date = date ?? document.date;
            document.preservationStage = preservationStage ?? document.preservationStage;
            if(metadata && Object.keys(metadata).length > 4) {
                return "Metadata cannot have more than 4 keys";
            }
            document.metadata = metadata ? metadata : document.metadata;
            this.saveDocument(document);
            return document;
        }
        return undefined;
    }

    //Mudar para delete logico
    async deleteDocument(id: string, user : User): Promise<boolean> {

        const document = await this.getDocumentById(id, user);
        if (!document) {
            return false;
        }
        await this.documentRepository.deleteDocument(id);
        return true;
    }


    async sendSIP(filename : string, folderName : string, documentData : CreateDocumentType, user : User){

        const filePath = process.env.REMOTE_UPLOAD_DIR || './uploads/'
        const locationUUID = process.env.LOCATION_UUID || 'UUID';
        const fullFilePath = process.env.REMOTE_UPLOAD_FULL_DIR || '/home/local-transfers/uploads/'

        const fullPathEncoded = Buffer.from(`${locationUUID}:${filePath}`).toString('base64');
        const fullBetaPathEncoded = Buffer.from(`${locationUUID}:${fullFilePath}${folderName}`).toString('base64').trim();

        try{

            if(typeof documentData.metadata == 'string'){
                documentData.metadata = JSON.parse(documentData.metadata);
            } 
            
            if(documentData.metadata && Object.keys(documentData.metadata).length > 4) {
                console.log(typeof documentData.metadata)
                console.log(documentData.metadata)
                console.log(Object.keys(documentData.metadata))
                return 'Metadata cannot have more than 4 keys';
            }

            const response = await http.post(
                `${this.apiURL}/api/v2beta/package`,
                ({
                    'name' : filename.toString(),
                    'processing_config' : 'automated',
                    'type' : 'standard',
                    'accession' : '',
                    'paths[]': fullPathEncoded,
                    'path' : fullBetaPathEncoded,
                    'row_id[]' : '',
                    'auto_approve' : true
                }),
                {
                    headers : {
                        Authorization : `ApiKey ${this.apiKey}`,
                        'Content-Type' : 'application/json',
                    }
                }
            )
            console.log(response.data.id)

            console.log(documentData.metadata)
            console.log(JSON.stringify(documentData.metadata || new Map<string, string>()))


            const newDocument = {
                name : filename,
                date : new Date(),
                preservationStage : PreservationStageEnum.INICIADA,
                metadata : documentData.metadata as unknown as Prisma.JsonObject,
                transferUUID : response.data.id,
                ownerId : user.id,
            } as Prisma.DocumentCreateInput;
            
            await this.saveDocument(newDocument);

            return null;

        }
        catch (error) {
            console.error('Error sending SIP:', error);
            return 'Error sending SIP';
        }
    }

    async getAIPStatus(uuidAIP : string){
        try{
            const response = await http.get(`${this.apiURL}/ingest/status/${uuidAIP}`, {headers : { 'Authorization' : `ApiKey ${this.apiKey}`}});
            return response.data.status
        } catch (error) {
            console.error('Error getting AIP status:', error);
            return 'Error getting AIP status';
        }
    }

    async getTransferData(documentId : string, user : User){

        try{
            const document = await this.getDocumentById(documentId, user);

            if(!document) {
                return 'Document not found'
            }   

            const responseStatus = await http.get(`${this.apiURL}/api/transfer/status/${document?.transferUUID}/`,
                {
                    headers : {
                        Authorization : `ApiKey ${this.apiKey}`,
                    }
                }
            )
            if(!document.SIPuuid) {
                if(responseStatus.data.sip_uuid) {
                    document.SIPuuid = responseStatus.data.sip_uuid;
                }
            }

            console.log(responseStatus.data.status)

            document.preservationStage = responseStatus.data.status == 'COMPLETE' ? PreservationStageEnum.PRESERVADO : 
            responseStatus.data.status == 'PROCESSING' ? PreservationStageEnum.INICIADA : PreservationStageEnum.FALHA;

            await this.saveDocument(document);

            return responseStatus.data
        } catch (error) {
            console.error('Error getting transfer data:', error);
            return 'Error getting transfer data';
        }
    }

    async getDocumentURL(documentId : string, user : User){
        try{
            const document = await this.getDocumentById(documentId, user);
            if(!document) {
                return 'Document not found'
            }

            const transferData = await this.getTransferData(documentId, user);
            if(!document.SIPuuid) {


                if(!transferData.sip_uuid) {
                    return 'Document not found'
                }

                document.SIPuuid = transferData.sip_uuid;
            }

            return `${this.storageServiceURL}/api/v2/file/${document.SIPuuid}/extract_file/?relative_path_to_file=${transferData.name}-${document.SIPuuid}/data/objects/${transferData.name}`;

        } catch (error) {
            console.error('Error getting document URL:', error);
            return 'Error getting document URL';
        }
    }

}