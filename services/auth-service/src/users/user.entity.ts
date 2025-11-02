import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Device } from "./device.entity";
import { UserSession } from "./user-session.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true, nullable: true })
  phone?: string;

  @Column()
  password!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  isEmailVerified!: boolean;

  @Column({ default: false })
  isPhoneVerified!: boolean;

  @Column({ type: "simple-array", default: "" })
  roles!: string[];

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  avatar?: string;

  // Настройки профиля
  @Column({ type: "json", nullable: true })
  profileSettings?: Record<string, any>;

  // 2FA настройки  
  @Column({ default: false })
  twoFactorEnabled!: boolean;

  @Column({ nullable: true })
  twoFactorSecret?: string;

  @Column({ type: "simple-array", nullable: true })
  backupCodes?: string[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  // Связи
  @OneToMany(() => Device, device => device.user)
  devices!: Device[];

  @OneToMany(() => UserSession, session => session.user)
  sessions!: UserSession[];
}
