import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'quark',
      password: process.env.DATABASE_PASSWORD || 'quarkpass',
      database: process.env.DATABASE_NAME || 'quark_dev',
      entities: [User],
      synchronize: true, // только для разработки
    }),
    AuthModule,
  ],
})
export class AppModule {}
