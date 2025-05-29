import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import bcrypt from 'bcryptjs';
import { StructurePerson } from "./structurePerson";
import { StructurePosition } from "./structurePosition";
import { IsString, IsUppercase } from "class-validator";

export enum UserRole {
    ADMIN = 'ADMIN',
    PEMBINA = 'PEMBINA',
    ANGGOTA = 'ANGGOTA'
}

@Entity()
export class user {

    @PrimaryGeneratedColumn('uuid')
    public id: string

    @Column({
        unique: true,
        nullable: true
    })
    public email: string

    @Column({
        nullable: false
    })
    public password: string

    
    @Column({
        type: 'enum',
        enum: UserRole,
    })
    @IsString()
    @IsUppercase()
    public role: UserRole

    @Column({
        default: null,
        nullable: false
    })
    public username: string

    @Column({
        default: null,
        nullable: false
    })
    @IsString()
    public image: string


    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date

    public hashPassword() {
        this.password = bcrypt.hashSync(this.password, 8);
    }

    public checkIfPasswordMatch(unencryptedPassword: string): boolean {
        return bcrypt.compareSync(unencryptedPassword, this.password);
    }
    
    @OneToMany (() => StructurePerson, (userStructure) => userStructure.updatedBy)
    public userStructure : StructurePerson 

    @OneToMany (() => StructurePosition, (userPosition) => userPosition.updatedBy)
    public userPosition : StructurePosition 

    
}