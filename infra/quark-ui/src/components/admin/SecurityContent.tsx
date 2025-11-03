"use client";

export function SecurityContent() {
  // ⚠️ MOCK DATA - Backend integration pending
  // API endpoints: /api/admin/security/{stats|events|login-attempts}
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-bold font-['Space_Grotesk']">Центр безопасности</h1>
        <p className="text-gray-500 dark:text-gray-400">Мониторинг и управление безопасностью системы</p>
      </div>
      
      <div className="p-8 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-lg">
          ⚠️ SecurityContent.tsx - компонент в разработке. Будет добавлен полный функционал:
        </p>
        <ul className="mt-4 ml-6 list-disc space-y-2">
          <li>Статистика безопасности (активные угрозы, заблокированные попытки)</li>
          <li>Настройки политик безопасности (автоблокировка, 2FA, таймауты сессий)</li>
          <li>Уровень защиты системы (файрвол, антивирус, шифрование)</li>
          <li>Последние события безопасности</li>
          <li>Мониторинг попыток входа с IP-адресами</li>
        </ul>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Mock-данные помечены комментариями для последующей замены на API-интеграцию.
        </p>
      </div>
    </div>
  );
}
