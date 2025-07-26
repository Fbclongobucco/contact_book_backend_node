import { Type } from "class-transformer"
import { IsDate, IsEmail, IsString, Length, Matches, Max, MaxDate } from "class-validator"

export class CreateUserDto {

    @IsString({ message: "o nome deve ser texto!" })
    name: string

    @IsString()
    @Matches(/^\d+$/, { message: 'O CPF deve conter apenas números.' })
    @Length(11, 11, { message: 'O CPF deve conter exatamente 11 dígitos.' })
    cpf: string


    @IsEmail({}, {message: "email inválido!"})
    email: string

    @Length(8, 50, {message: "a senha deve ter entre 8 e 50 caracteres!"})
    password: string

    @Type(()=>Date)
    @IsDate({message: "A data de nascimento deve ser uma data válida."})
    @MaxDate(new Date(), {message: 'A data de nascimento não pode estar no futuro!'})
    birthday: Date


}
