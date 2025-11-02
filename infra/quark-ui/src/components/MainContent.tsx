"use client";

// Chakra UI удалён, используем div/p/span и Tailwind

export function MainContent() {
  // Цвета для Tailwind: text-cyan-400 (dark), text-gray-900 (light)

  return (
    <div className="flex-1 p-6">
      <div className="flex flex-col gap-6 h-full">
        <div>
          <p className="text-3xl font-bold mb-2 font-spaceGrotesk text-gray-900 dark:text-cyan-400">
            Добро пожаловать в Quark
          </p>
          <p className="text-gray-500 text-lg">
            Ваша цифровая вселенная для самовыражения
          </p>
        </div>

        <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800 shadow-lg">
          <p className="text-lg font-semibold mb-3">🚀 Быстрый старт</p>
          <div className="flex flex-col gap-2">
            <p className="text-gray-600">• Создайте свой первый пост в блоге</p>
            <p className="text-gray-600">• Начните общение в мессенджере</p>
            <p className="text-gray-600">• Настройте ИИ-помощника</p>
            <p className="text-gray-600">• Исследуйте доступные плагины</p>
          </div>
        </div>
      </div>
    </div>
  );
}
