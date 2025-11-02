import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Device, DeviceStatus } from "./device.entity";
import { RegisterDeviceDto, DeviceResponseDto } from "../common/dto/profile.dto";

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
  ) {}

  async registerDevice(userId: string, deviceDto: RegisterDeviceDto, ipAddress?: string): Promise<Device> {
    // Проверяем, существует ли уже устройство с таким отпечатком
    const existingDevice = await this.deviceRepository.findOne({
      where: { 
        userId, 
        deviceFingerprint: deviceDto.deviceFingerprint 
      }
    });

    if (existingDevice) {
      // Обновляем информацию о существующем устройстве
      existingDevice.lastSeenAt = new Date();
      existingDevice.ipAddress = ipAddress;
      existingDevice.status = DeviceStatus.ACTIVE;
      return this.deviceRepository.save(existingDevice);
    }

    // Создаем новое устройство
    const device = this.deviceRepository.create({
      userId,
      name: deviceDto.name,
      type: deviceDto.type,
      userAgent: deviceDto.userAgent,
      ipAddress,
      location: deviceDto.location,
      deviceFingerprint: deviceDto.deviceFingerprint,
      lastSeenAt: new Date(),
    });

    return this.deviceRepository.save(device);
  }

  async getUserDevices(userId: string, currentDeviceId?: string): Promise<DeviceResponseDto[]> {
    const devices = await this.deviceRepository.find({
      where: { userId },
      order: { lastSeenAt: "DESC" }
    });

    return devices.map(device => ({
      id: device.id,
      name: device.name,
      type: device.type,
      status: device.status,
      location: device.location,
      lastSeenAt: device.lastSeenAt,
      isTrusted: device.isTrusted,
      isCurrentDevice: device.id === currentDeviceId,
      createdAt: device.createdAt,
    }));
  }

  async updateDeviceActivity(deviceId: string, ipAddress?: string): Promise<void> {
    await this.deviceRepository.update(deviceId, {
      lastSeenAt: new Date(),
      ipAddress,
    });
  }

  async trustDevice(userId: string, deviceId: string): Promise<void> {
    await this.deviceRepository.update(
      { id: deviceId, userId },
      { isTrusted: true }
    );
  }

  async revokeDevice(userId: string, deviceId: string): Promise<void> {
    await this.deviceRepository.update(
      { id: deviceId, userId },
      { status: DeviceStatus.BLOCKED }
    );
  }

  async removeDevice(userId: string, deviceId: string): Promise<void> {
    await this.deviceRepository.delete({ id: deviceId, userId });
  }

  async isDeviceTrusted(userId: string, deviceFingerprint: string): Promise<boolean> {
    const device = await this.deviceRepository.findOne({
      where: { 
        userId, 
        deviceFingerprint,
        isTrusted: true,
        status: DeviceStatus.ACTIVE
      }
    });
    
    return !!device;
  }
}
