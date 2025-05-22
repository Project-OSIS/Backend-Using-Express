import { IsString, IsNumber } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn, ManyToOne } from 'typeorm';
import { StructurePosition } from './structurePosition';
import { user } from './user';

@Entity()
export class StructurePerson{
    @PrimaryGeneratedColumn('uuid')
    public id: string

    @Column()
    @IsString()
    public personName : string

    @Column()
    @IsString()
    public descriptionPerson : string
    
    @Column({
        type : 'longtext',
        default : null,
        nullable : true
    })
    @IsString()
    public image : string

    @Column()
    @IsNumber()
    public rank: number

    @CreateDateColumn()
    public createdAt : Date

    @UpdateDateColumn()
    public updateAt : Date

    @DeleteDateColumn()
    public deletedAt : Date

    @ManyToOne (() => StructurePosition,(structuresPosition) => structuresPosition.structuresPerson)
    @JoinColumn() 
    public structuresPosition : StructurePosition   

    @ManyToOne(()=> user,(updatedBy) => updatedBy.userStructure)
    @JoinColumn()
    public updatedBy : user

  

}