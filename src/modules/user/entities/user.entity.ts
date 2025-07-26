import { IsEmail } from "class-validator"
import { Contact } from "src/modules/contact/entities/contact.entity"
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column({type: "varchar", length: 200})
    name: string

    @Column({type: "varchar", length: 11})
    cpf: string

    @Column({type: "varchar", length: 150})
    @IsEmail()
    email: string

    @Column({type: "varchar", length: 300})
    password: string

    @Column()
    birthday: Date

    @CreateDateColumn()
    createAt: Date

    @UpdateDateColumn()
    updateAt: Date

    @OneToMany(() => Contact, contacts => contacts.user)
    contacts: Contact[]
}
