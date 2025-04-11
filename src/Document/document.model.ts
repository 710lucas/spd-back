import { PreservationStageEnum } from "src/Enums/PreservationStageEnum";

export class Document {
  id: string;
  name: string;
  date: Date;
  preservationStage: PreservationStageEnum;

  constructor(
    id: string,
    name: string,
    date: Date,
    preservationStage: PreservationStageEnum
  ) {
    this.id = id;
    this.name = name;
    this.date = date;
    this.preservationStage = preservationStage;
  }
}