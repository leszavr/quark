import { Injectable } from "@nestjs/common";
import { JwtModuleOptions, JwtOptionsFactory } from "@nestjs/jwt";
import { VaultService } from "../vault/vault.service";

@Injectable()
export class JwtConfigService implements JwtOptionsFactory {
  constructor(private readonly vaultService: VaultService) {}

  async createJwtOptions(): Promise<JwtModuleOptions> {
    const secret = await this.vaultService.getJWTSecret();
    return {
      secret,
      signOptions: { expiresIn: "1h" },
    };
  }
}
