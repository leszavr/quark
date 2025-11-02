import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { DynamicJwtService } from "./dynamic-jwt.service";
import { UsersModule } from "../users/users.module";
import { VaultModule } from "../vault/vault.module";

@Module({
  imports: [
    UsersModule,
    VaultModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || "your-secret-key",
      signOptions: { expiresIn: "1h" },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, DynamicJwtService],
  exports: [AuthService, DynamicJwtService],
})
export class AuthModule {}
