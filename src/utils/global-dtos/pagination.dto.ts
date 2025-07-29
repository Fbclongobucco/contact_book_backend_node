import { Type } from "class-transformer";
import { IsInt, IsOptional, Min } from "class-validator";

export class PaginationDto {

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    size?: number;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number;
}