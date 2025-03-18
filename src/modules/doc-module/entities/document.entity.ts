import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { DocumentStatus } from "../enums/document-status.enum";
import { BaseEntity } from "../../../database/base/base.entity";

@Entity()
export class DocumentEntitiy extends BaseEntity {
    @PrimaryGeneratedColumn({name: 'increment_id'})
    id: number;

    @Column({name: 'title'})
    title: string;

    @Column({name: 'description', type: 'text', nullable: true})
    description: string;

    @Column({name: 'file_path'})
    filePath: string;

    @Column({type: 'enum', enum: DocumentStatus, default: DocumentStatus.UPLOADED})
    status: DocumentStatus;
    
    @Index()
    @Column({name: 'created_by', type: 'text'})
    createdBy: string;

}