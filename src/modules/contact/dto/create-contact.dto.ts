import { IsString, Length, Matches, Max, Min } from "class-validator"

export class CreateContactDto {

    @IsString()
    @Length(3, 200, {
        message: "O nome do contato deve ter entre 3 e 200 caracteres.",
    })
    name: string

    @IsString()
    @Length(11, 11, { message: 'O número deve conter exatamente 11 dígitos.' })
    @Matches(/^\d+$/, { message: 'O número deve conter apenas números.' })
    number: string


}
