"use client";

import { useState, useRef } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Card } from "@ui/card";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Textarea } from "@ui/textarea";
import { Avatar } from "@ui/avatar";

interface UserProfile {
  avatar: string | null;
  fullName: string;
  email: string;
  bio: string;
}

export function BasicInfoTab() {
  // Simple toast replacement
  const showToast = (msg: string) => alert(msg);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Состояние профиля (позже подключим к глобальному стору)
  const [profile, setProfile] = useState<UserProfile>({
    avatar: null,
    fullName: "Иван Иванов",
    email: "ivan@example.com",
    bio: "Разработчик и энтузиаст новых технологий",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState<UserProfile>(profile);

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверяем тип файла
    if (!file.type.startsWith("image/")) {
      showToast("Пожалуйста, выберите изображение");
      return;
    }

    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("Размер файла не должен превышать 5MB");
      return;
    }

    // Создаем URL для превью
    const imageUrl = URL.createObjectURL(file);
    setEditProfile(prev => ({ ...prev, avatar: imageUrl }));
  };

  const handleRemoveAvatar = () => {
    setEditProfile(prev => ({ ...prev, avatar: null }));
  };

  const handleSave = () => {
    // Валидация
    if (!editProfile.fullName.trim()) {
      showToast("Имя пользователя не может быть пустым");
      return;
    }

    if (!editProfile.email.trim()) {
      showToast("Email не может быть пустым");
      return;
    }

    // Email валидация
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editProfile.email)) {
      showToast("Введите корректный email адрес");
      return;
    }

    // Сохраняем данные
    setProfile(editProfile);
    setIsEditing(false);
    
    showToast("Профиль обновлен");
  };

  const handleCancel = () => {
    setEditProfile(profile);
    setIsEditing(false);
  };

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-lg font-semibold">Основная информация</div>
            <div className="text-gray-600 dark:text-gray-400 mt-1 text-sm">Управляйте своими персональными данными</div>
          </div>
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs">Активный профиль</span>
        </div>

        <div className="flex flex-col gap-6">
          {/* Секция аватара */}
          <div>
            <div className="block text-sm font-semibold mb-3">Фотография профиля</div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar
                  size="xl"
                  src={isEditing ? editProfile.avatar || undefined : profile.avatar || undefined}
                  name={isEditing ? editProfile.fullName : profile.fullName}
                />
                {isEditing && (
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Загрузить фото"
                  >
                    <Camera size={16} />
                  </button>
                )}
              </div>
              {isEditing && (
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Upload size={16} />
                    Загрузить фото
                  </Button>
                  {editProfile.avatar && (
                    <Button
                      size="sm"
                      onClick={handleRemoveAvatar}
                      variant="ghost"
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X size={16} />
                      Удалить
                    </Button>
                  )}
                  <span className="text-xs text-gray-500">JPG, PNG до 5MB</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              style={{ display: "none" }}
            />
          </div>

          <hr className="my-4" />

          {/* Основные поля */}
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold mb-1">Полное имя</label>
              <Input
                id="fullName"
                value={isEditing ? editProfile.fullName : profile.fullName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => isEditing && setEditProfile(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Введите ваше полное имя"
                readOnly={!isEditing}
                className={isEditing ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-1">Email адрес</label>
              <Input
                id="email"
                type="email"
                value={isEditing ? editProfile.email : profile.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => isEditing && setEditProfile(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
                readOnly={!isEditing}
                className={isEditing ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"}
              />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-semibold mb-1">О себе</label>
              <Textarea
                id="bio"
                value={isEditing ? editProfile.bio : profile.bio}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => isEditing && setEditProfile(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Расскажите о себе..."
                readOnly={!isEditing}
                rows={4}
                className={isEditing ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"}
              />
            </div>
          </div>

          <hr className="my-4" />

          {/* Кнопки действий */}
          <div className="flex justify-end gap-3">
            {isEditing ? (
              <>
                <Button variant="ghost" onClick={handleCancel}>
                  Отмена
                </Button>
                <Button variant="default" onClick={handleSave}>
                  Сохранить изменения
                </Button>
              </>
            ) : (
              <Button variant="default" onClick={() => setIsEditing(true)}>
                Редактировать профиль
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}