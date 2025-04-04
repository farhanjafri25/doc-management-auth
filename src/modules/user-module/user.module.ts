import { Module } from "@nestjs/common";
import { UserAuthController } from "./controllers/auth.controller";
import { UserAuthRepository } from "./repositories/user.repository";
import { UserAuthService } from "./services/user.service";
import { AccessTokenStrategy, RefreshTokenStrategy } from "src/strategies";
import { JwtModule } from "@nestjs/jwt";
import { Utility } from "../utils/utility";
import { CacheModule } from "@nestjs/cache-manager";

@Module({
    imports: [JwtModule.register({secret: `${process.env.JWT_SECRET}`}), CacheModule.register()],
    controllers: [UserAuthController],
    providers: [UserAuthRepository, UserAuthService, AccessTokenStrategy, RefreshTokenStrategy, Utility],
    exports: [UserAuthService, UserAuthRepository, AccessTokenStrategy, RefreshTokenStrategy, Utility]
})
export class UserAuthModule {}