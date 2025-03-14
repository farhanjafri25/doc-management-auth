import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { UserManagementController } from "./controllers/user-management.controller";
import { UserManagementService } from "./services/user-management.service";
import { UserManagementRepository } from "./repositories/user-management.repository";
import { AccessTokenStrategy, RefreshTokenStrategy } from "src/strategies";

@Module({
    imports: [JwtModule.register({secret: `${process.env.JWT_SECRET}`})],
    controllers: [UserManagementController],
    providers: [UserManagementService, UserManagementRepository, AccessTokenStrategy, RefreshTokenStrategy],
    exports: [UserManagementService, UserManagementRepository, AccessTokenStrategy, RefreshTokenStrategy]
})

export class UserManagementModule {}