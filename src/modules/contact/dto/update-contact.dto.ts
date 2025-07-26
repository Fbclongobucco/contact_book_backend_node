import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateContactDto } from './create-contact.dto';

export class UpdateContactDto extends PartialType(PickType(CreateContactDto, ['name', 'number'])) {
    
}
