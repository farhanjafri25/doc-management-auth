import { BaseEntity } from "src/database/base/base.entity";
import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity({name: 'user_roles'})
@Unique(['roleName'])
export class UserRolesEntity extends BaseEntity {
    @PrimaryGeneratedColumn({ name: "role_id" })
    roleId: number;

    @Index()
    @Column({name: 'role_name', nullable: false})
    roleName: string;

    @Column({name: 'can_read', nullable: false, default: false})
    canRead: boolean;

    @Column({name: 'can_write', nullable: false, default: false})
    canWrite: boolean;

    @Column({name: 'can_delete', nullable: false, default: false})
    canDelete: boolean;

}