import { BaseEntity } from "src/database/base/base.entity";
import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from "typeorm";
import { UserRoleEnum } from "../enums/roles.enum";

@Entity({ name: "users" })
@Unique(["email"])
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn({name: 'increment_id'})
    id: number;

    @Index()
    @Column({name: 'user_id', primary: true, nullable: false})
    userId: string;

    @Index()
    @Column({name: 'email', nullable: false})
    email: string;

    @Column({name: 'password', nullable: false})
    password: string;

    @Column({ name: "role", type: 'enum', enum: UserRoleEnum, default: UserRoleEnum.VIEWER })
    role: UserRoleEnum;
}