import { PreservationStageEnum } from "src/Enums/PreservationStageEnum";

export class Document {
  id: string;
  name: string;
  date: Date;
  preservationStage: PreservationStageEnum;
  metadata: Map<string, string> = new Map<string, string>();
  SIPuuid: string;
  transferUUID: string;

  constructor(
    id: string,
    name: string,
    date: Date,
    preservationStage: PreservationStageEnum,
    metadata? : Map<string, string>,
    SIPuuid? : string,
    transferUUID? : string
  ) {
    this.id = id;
    this.name = name;
    this.date = date;
    this.preservationStage = preservationStage;
    this.metadata = metadata ? metadata : new Map<string, string>();
    this.SIPuuid = SIPuuid ? SIPuuid : '';
    this.transferUUID = transferUUID ? transferUUID : '';
  }
}