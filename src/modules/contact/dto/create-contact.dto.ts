import { IsString, Length, Matches, Max, Min } from "class-validator"

export class CreateContactDto {

    @IsString()
    @Max(200, { message: "O contato deve ter no máximo 200 caractares!" })
    @Min(3, { message: "O contato deve ter no mínimo 200 caractares!" })
    name: string

    @IsString()
    @Length(11, 11, { message: 'O número deve conter exatamente 11 dígitos.' })
    @Matches(/^\d+$/, { message: 'O contato deve conter apenas números.' }) 
    number: string

    @IsString()
    @Matches(/^\d+$/, { message: 'O Id deve ser um número!' }) 
    userId: number
}
