import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Device } from './device.entity';
import { UserSession } from './user-session.entity';
import { UsersService } from './users.service';
import { DeviceService } from './device.service';
import { TwoFactorService } from './two-factor.service';
import { ProfileController } from './profile.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Device, UserSession])],
  controllers: [ProfileController],
  providers: [UsersService, DeviceService, TwoFactorService],
  exports: [UsersService, DeviceService, TwoFactorService],
})
export class UsersModule {}
