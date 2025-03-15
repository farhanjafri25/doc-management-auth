import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { DocumentController } from "./controllers/doc.controller";
import { DocumentRepository } from "./repositories/doc.repository";
import { DocumentService } from "./services/doc.service";
import { AccessTokenStrategy, RefreshTokenStrategy } from "src/strategies";

@Module({
    imports: [
        JwtModule.register({ secret: `${process.env.JWT_SECRET}` }),
        MulterModule.register({
            storage: diskStorage({
                destination: './uploads/documents',
                filename: (req, file, cb) => {
                    const filename = `${Date.now()}-${file.originalname}`;
                    return cb(null, filename);
                }
            }),
            fileFilter: (req, file, callback) => {
                if(!file.originalname.match(/\.(pdf|doc|docx)$/)) {
                    return callback(new Error('Only PDF, DOC and DOCX files are allowed!'), false);
                }
                callback(null, true);
            }
        }),
    ],
    controllers: [DocumentController],
    providers: [DocumentRepository, DocumentService, AccessTokenStrategy, RefreshTokenStrategy],
    exports: [DocumentRepository, DocumentService, AccessTokenStrategy, RefreshTokenStrategy]
})
export class DocumentModule {}
