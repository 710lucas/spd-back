export type UpdateDocumentDTO = {
    name? : string;
    date? : Date;
    preservationStage? : string;
    metadata? : Map<string, string>;
    SIPuuid? : string;
    transferUUID? : string;
}