import { PreservationStageEnum } from "src/Enums/PreservationStageEnum";

export type CreateDocumentType = {
    name: string;
    date: Date;
    preservationStage: PreservationStageEnum;
    metadata?: Map<string, string>;
}