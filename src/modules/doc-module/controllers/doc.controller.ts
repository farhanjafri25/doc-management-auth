import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { AppInterceptor } from "src/app.interceptor";
import { DocumentService } from "../services/doc.service";
import { Roles } from "src/decorators";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadFileDto } from "../dtos/uploadFile.dto";
import { DocumentEntitiy } from "../entities/document.entity";

@UseInterceptors(AppInterceptor)
@Controller('/document')
export class DocumentController {
    constructor(private readonly documentsService: DocumentService) { }

    @Post('/create')
    @Roles('admin')
    @UseInterceptors(FileInterceptor('file'))
    async uploadDocument(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: UploadFileDto,
    ): Promise<DocumentEntitiy> {
        return await this.documentsService.createDocument({
            ...body,
            filePath: file.path
        })
    }

    @Get('/all')
    @Roles('admin', 'editor', 'viewer')
    public async fetchAllDocuments(): Promise<DocumentEntitiy[]> {
        return await this.documentsService.fetchAllDocuments();
    }

    @Get('/:id')
    @Roles('admin', 'editor', 'viewer')
    public async fetchDocumentById(@Param('id') id: number): Promise<DocumentEntitiy> {
        return await this.documentsService.getDocumentById(id);
    }

    @Patch('/:id')
    @Roles('admin', 'editor')
    public async updateDocument(@Body() body: Partial<DocumentEntitiy>,
        @Param('id') id: number): Promise<DocumentEntitiy> {
        return await this.documentsService.updateDocument(id, body);
    }

    @Delete('/:id')
    @Roles('admin')
    public async deleteDocument(@Param('id') id: number): Promise<any> {
        return await this.documentsService.deleteDocument(id);
    }

}
