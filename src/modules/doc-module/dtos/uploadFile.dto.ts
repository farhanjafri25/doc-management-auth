import { IsNotEmpty, IsString } from "class-validator";

export class UploadFileDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsString()
    @IsNotEmpty()
    createdBy: string;
}