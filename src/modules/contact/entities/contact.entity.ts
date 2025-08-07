import { User } from "src/modules/user/entities/user.entity"
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Contact {

    @PrimaryGeneratedColumn()
    id: number

    @Column({type: "varchar", length: 200})
    name: string

    @Column({type: "varchar", length: 11})
    number: string

    @ManyToOne(() => User, user => user.contacts, {onDelete: "CASCADE"})
    user: User
    
}
