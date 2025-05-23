import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDocumentTypeDto {
    @IsString()
    @IsNotEmpty()
    doc_type_name: string;
}
