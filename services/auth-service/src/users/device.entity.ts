import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entity";

export enum DeviceType {
  WEB = "web",
  MOBILE_IOS = "mobile_ios",
  MOBILE_ANDROID = "mobile_android",
  DESKTOP = "desktop",
  API = "api",
}

export enum DeviceStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  BLOCKED = "blocked",
}

@Entity("devices")
export class Device {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "enum", enum: DeviceType })
  type!: DeviceType;

  @Column({ type: "enum", enum: DeviceStatus, default: DeviceStatus.ACTIVE })
  status!: DeviceStatus;

  @Column({ type: "varchar", length: 255, nullable: true })
  userAgent?: string;

  @Column({ type: "varchar", length: 45, nullable: true })
  ipAddress?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  location?: string;

  @Column({ type: "varchar", length: 255, unique: true })
  deviceFingerprint!: string;

  @Column({ type: "timestamp", nullable: true })
  lastSeenAt?: Date;

  @Column({ type: "boolean", default: false })
  isTrusted!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, user => user.devices)
  @JoinColumn({ name: "userId" })
  user!: User;
}
