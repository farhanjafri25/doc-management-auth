import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { IngestionService } from "../services/ingestion.service";
import { Roles } from "src/decorators";

@Controller('/ingestion')
export class IngestionController {
    constructor(private readonly ingestionSerivce: IngestionService) {}

    @Post('/create')
    public async createIngestion(@Body('documentId') documentId: number) {
        return await this.ingestionSerivce.triggerIngestion(documentId);
    }

    @Get('/:id')
    public async getIngestionById(@Param('id') ingestionId: number) {
        return await this.ingestionSerivce.fetchIngestionById(ingestionId);
    }

    @Delete('/:id')
    @Roles('admin')
    async deleteIngestion(@Param("id") ingestionId: number) {
        return await this.ingestionSerivce.deleteIngestion(ingestionId);
    }
}