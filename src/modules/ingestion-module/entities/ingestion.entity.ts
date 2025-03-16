import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IngestionStatus } from "../enums/ingestion-status.enum";
import { BaseEntity } from "src/database/base/base.entity";

@Entity({name: "ingestion_entity"})
export class IngestionEntity extends BaseEntity {
    @PrimaryGeneratedColumn({name: "ingestion_id"})
    ingestionId: number

    @Column({name: 'document', nullable: false})
    document: string

    @Column({name: 'document_id', nullable: false})
    documentId: number

    @Column({ name: 'ingestion_status', nullable: false, type: 'enum', enum: IngestionStatus, default: IngestionStatus.PENDING })
    ingestionStatus: IngestionStatus
}