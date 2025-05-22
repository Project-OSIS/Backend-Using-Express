import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { IsString } from "class-validator";



@Entity()
export class proker {

    @PrimaryGeneratedColumn('uuid')
    public id: string

    @Column({
        default: null,
        nullable: false
    })
    public title: string

    @Column({
        default: null,
        nullable: false,

    })
    public description: string

    
   @Column({
        type : 'longtext',
        default : null,
        nullable : true
    })
    @IsString()
    public image: string


    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date


    
}