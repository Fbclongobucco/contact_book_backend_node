import { PaginationDto } from "src/utils/global-dtos/pagination.dto";
import { IsOptional, IsString } from "class-validator";

export class SearchContactDto extends PaginationDto {
  @IsOptional()
  @IsString()
  q?: string;
}
