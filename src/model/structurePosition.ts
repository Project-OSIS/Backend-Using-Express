import { IsString } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToOne, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { user } from './user';
import { StructurePerson } from './structurePerson';

@Entity()
export class StructurePosition{
    @PrimaryGeneratedColumn('uuid')
    public id: string

    @Column()
    @IsString()
    public positionName : string

    @OneToMany (() => StructurePerson,(structuresPerson) => structuresPerson.structuresPosition)
    public structuresPerson : StructurePerson[] 

    @CreateDateColumn()
    public createdAt : Date

    @UpdateDateColumn()
    public updateAt : Date

    @DeleteDateColumn()
    public deletedAt : Date

    
    @ManyToOne (() => user,(updatedBy) => updatedBy.userPosition)
    @JoinColumn() 
    public updatedBy : user   


    
}