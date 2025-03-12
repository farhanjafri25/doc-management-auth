import { BeforeInsert, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export class BaseEntity {
    @CreateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        name: 'created_at'
    })
    public createdAt: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        name: 'updated_at'
    })
    public updatedAt: Date;

    @Column({
        nullable: false,
        name: `is_deleted`,
        default: false
    })
    public isDeleted: boolean;

    @BeforeInsert()
    beforeInsertActions() {
        this.isDeleted = false;
    }
}