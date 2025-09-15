import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from './config/config.module';
import { VaultModule } from './vault/vault.module';
import { JwtConfigService } from './config/jwt.config';

@Module({
  imports: [
    ConfigModule,
    VaultModule,
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'quark',
      password: process.env.DB_PASSWORD || 'quarkpass',
      database: process.env.DB_NAME || 'quark_auth',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [VaultModule],
      useClass: JwtConfigService,
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [JwtConfigService],
})
export class AppModule {}
