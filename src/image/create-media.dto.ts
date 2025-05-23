import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateMediaDto {
    @IsOptional()
    @IsString({ each: true })
    descriptions?: string[];

    @IsOptional()
    @IsUrl({}, { each: true })
    youtubeLinks?: string[];

    @IsOptional()
    @IsString({ each: true })
    youtubeDescriptions?: string[];
}
