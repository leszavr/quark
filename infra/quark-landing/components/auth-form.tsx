interface AuthTextType {
  email: string;
  password: string;
  confirmPassword: string;
  createAccount: string;
  signInTitle: string;
}


import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { getTranslation, DEFAULT_LANGUAGE, type Language } from "@/lib/i18n";

interface AuthFormProps {
  mode: "login" | "signup"
  onSubmit: () => Promise<void>
  isLoading: boolean
}

export default function AuthForm({ mode, onSubmit, isLoading }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [language] = useState<Language>(DEFAULT_LANGUAGE);

  const authText = getTranslation(language, "auth") as AuthTextType;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = "Электронная почта обязательна";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Пожалуйста, введите корректный адрес электронной почты";
    }

    if (!password) {
      newErrors.password = "Пароль обязателен";
    } else if (password.length < 8) {
      newErrors.password = "Пароль должен содержать минимум 8 символов";
    }

    if (mode === "signup") {
      if (!confirmPassword) {
        newErrors.confirmPassword = "Пожалуйста, подтвердите пароль";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Пароли не совпадают";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onSubmit();
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setErrors({});
    } catch {
      setErrors({ submit: "Произошла ошибка. Пожалуйста, попробуйте снова." });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.submit && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle size={16} className="text-destructive" />
          <p className="text-sm text-destructive">{errors.submit}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">{authText.email}</label>
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors({ ...errors, email: "" });
          }}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">{authText.password}</label>
        <Input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors({ ...errors, password: "" });
          }}
          className={errors.password ? "border-destructive" : ""}
        />
        {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
      </div>

      {mode === "signup" && (
        <div>
          <label className="block text-sm font-medium mb-2">{authText.confirmPassword}</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
            }}
            className={errors.confirmPassword ? "border-destructive" : ""}
          />
          {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
        </div>
      )}

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
        {isLoading ? "Загрузка..." : mode === "signup" ? authText.createAccount : authText.signInTitle}
      </Button>
    </form>
  );
}
