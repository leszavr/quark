// Переключение вкладок
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Удалить активный класс у всех вкладок и контентов
        document.querySelectorAll('.tab').forEach(t => {
            t.classList.remove('text-indigo-600', 'border-indigo-600');
            t.classList.add('text-gray-500');
        });
        document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
        
        // Добавить активный класс к текущей вкладке
        tab.classList.remove('text-gray-500');
        tab.classList.add('text-indigo-600', 'border-indigo-600');
        
        // Показать соответствующий контент
        const tabName = tab.getAttribute('data-tab');
        document.getElementById(tabName).classList.remove('hidden');
    });
});

// Проверка сервисов
async function checkService(url, elementId) {
    try {
        // Для проверки доступности сервиса используем fetch с таймаутом
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 секунд таймаут
        
        const response = await fetch(url, { 
            method: 'GET',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Обновляем статус в таблице
        const element = document.getElementById(elementId);
        if (response.ok || response.status === 404) {
            // Считаем сервис доступным, даже если возвращает 404 (это значит, что он отвечает)
            element.textContent = '✅ Готов';
            element.className = 'px-6 py-4 whitespace-nowrap text-green-500';
        } else if (response.status === 401) {
            // Сервис требует аутентификации, но доступен
            element.textContent = '✅ Готов (требуется авторизация)';
            element.className = 'px-6 py-4 whitespace-nowrap text-yellow-500';
        } else {
            element.textContent = '❌ Ошибка';
            element.className = 'px-6 py-4 whitespace-nowrap text-red-500';
        }
    } catch (error) {
        // Проверим, может быть это проблема с CORS
        // В этом случае попробуем выполнить HEAD запрос
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 секунд таймаут
            
            const response = await fetch(url, { 
                method: 'HEAD',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            // Обновляем статус в таблице
            const element = document.getElementById(elementId);
            if (response.ok || response.status === 404) {
                // Считаем сервис доступным, даже если возвращает 404 (это значит, что он отвечает)
                element.textContent = '✅ Готов';
                element.className = 'px-6 py-4 whitespace-nowrap text-green-500';
            } else if (response.status === 401) {
                // Сервис требует аутентификации, но доступен
                element.textContent = '✅ Готов (требуется авторизация)';
                element.className = 'px-6 py-4 whitespace-nowrap text-yellow-500';
            } else {
                element.textContent = '❌ Ошибка';
                element.className = 'px-6 py-4 whitespace-nowrap text-red-500';
            }
        } catch (error) {
            // Обновляем статус в таблице на "не доступен"
            const element = document.getElementById(elementId);
            element.textContent = '❌ Недоступен';
            element.className = 'px-6 py-4 whitespace-nowrap text-red-500';
            console.error(`Ошибка при проверке сервиса ${url}:`, error);
        }
    }
}

// Проверяем сервисы при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Обновляем статус системы
    document.getElementById('system-status').textContent = 'Проверка сервисов завершена';
    
    // Проверяем доступность сервисов
    checkService('http://localhost:3001/health', 'auth-status');
    checkService('http://localhost:3002/', 'user-status');
    checkService('http://localhost:3003/media', 'media-status');
    checkService('http://localhost:3004/', 'blog-status');
});

// Регистрация и вход
document.getElementById('register-btn').addEventListener('click', async () => {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    
    try {
        const response = await fetch('http://localhost:3001/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, username: email.split('@')[0] })
        });
        
        const data = await response.json();
        if (response.ok) {
            document.getElementById('auth-result').innerHTML = `<span class="text-green-500">Регистрация успешна! Токен: ${data.access_token}</span>`;
            localStorage.setItem('authToken', data.access_token);
        } else {
            document.getElementById('auth-result').innerHTML = `<span class="text-red-500">Ошибка регистрации: ${data.message || 'Неизвестная ошибка'}</span>`;
        }
    } catch (error) {
        document.getElementById('auth-result').innerHTML = `<span class="text-red-500">Ошибка: ${error.message}</span>`;
    }
});

document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    
    try {
        const response = await fetch('http://localhost:3001/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        if (response.ok) {
            document.getElementById('auth-result').innerHTML = `<span class="text-green-500">Вход успешен! Токен: ${data.access_token}</span>`;
            localStorage.setItem('authToken', data.access_token);
        } else {
            document.getElementById('auth-result').innerHTML = `<span class="text-red-500">Ошибка входа: ${data.message || 'Неизвестная ошибка'}</span>`;
        }
    } catch (error) {
        document.getElementById('auth-result').innerHTML = `<span class="text-red-500">Ошибка: ${error.message}</span>`;
    }
});

// Загрузка изображения
document.getElementById('upload-btn').addEventListener('click', async () => {
    const fileInput = document.getElementById('image-file');
    const file = fileInput.files[0];
    
    if (!file) {
        document.getElementById('upload-result').innerHTML = '<span class="text-red-500">Выберите файл для загрузки</span>';
        return;
    }
    
    const token = localStorage.getItem('authToken');
    if (!token) {
        document.getElementById('upload-result').innerHTML = '<span class="text-red-500">Сначала выполните вход</span>';
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'avatar'); // Установим тип по умолчанию
        
        const response = await fetch('http://localhost:3003/media/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const data = await response.json();
        if (response.ok) {
            document.getElementById('upload-result').innerHTML = `<span class="text-green-500">Файл успешно загружен!</span>`;
            // Показываем превью изображения и путь к файлу
            document.getElementById('image-preview').innerHTML = `
                <div class="mt-4">
                    <p class="font-medium">Файл загружен по адресу:</p>
                    <p class="break-all text-sm bg-gray-100 p-2 rounded mb-2">${data.url}</p>
                    <p class="font-medium">Миниатюра:</p>
                    <p class="break-all text-sm bg-gray-100 p-2 rounded mb-2">${data.thumbnailUrl}</p>
                    <img src="${data.url}" alt="Preview" class="mt-2 max-w-full h-auto rounded border">
                </div>
            `;
        } else {
            document.getElementById('upload-result').innerHTML = `<span class="text-red-500">Ошибка загрузки: ${data.message || 'Неизвестная ошибка'}</span>`;
        }
    } catch (error) {
        if (error instanceof TypeError && error.message.includes('fetch')) {
            document.getElementById('upload-result').innerHTML = `<span class="text-red-500">Ошибка сети: не удалось подключиться к серверу. Убедитесь, что media-service запущен.</span>`;
        } else {
            document.getElementById('upload-result').innerHTML = `<span class="text-red-500">Ошибка: ${error.message}</span>`;
        }
    }
});

// Просмотр профиля
document.getElementById('profile-btn').addEventListener('click', async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        document.getElementById('profile-result').textContent = 'Сначала выполните вход';
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3001/auth/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        if (response.ok) {
            document.getElementById('profile-result').textContent = JSON.stringify(data, null, 2);
        } else {
            document.getElementById('profile-result').textContent = `Ошибка: ${data.message || 'Неизвестная ошибка'}`;
        }
    } catch (error) {
        document.getElementById('profile-result').textContent = `Ошибка: ${error.message}`;
    }
});

// Создание блога
document.getElementById('create-blog-btn').addEventListener('click', async () => {
    const token = localStorage.getItem('authToken');
    const userId = document.getElementById('user-id').value;
    const title = document.getElementById('blog-title').value;
    const subdomain = document.getElementById('blog-subdomain').value;
    
    if (!token) {
        document.getElementById('blog-result').textContent = 'Сначала выполните вход';
        return;
    }
    
    if (!userId || !title || !subdomain) {
        document.getElementById('blog-result').textContent = 'Заполните все поля';
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3004/blogs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                user_id: userId,
                title: title,
                subdomain: subdomain,
                description: "Блог, созданный через playground"
            })
        });
        
        const data = await response.json();
        if (response.ok) {
            document.getElementById('blog-result').textContent = `Блог успешно создан:\n${JSON.stringify(data, null, 2)}`;
        } else {
            document.getElementById('blog-result').textContent = `Ошибка: ${data.detail || 'Неизвестная ошибка'}`;
        }
    } catch (error) {
        document.getElementById('blog-result').textContent = `Ошибка: ${error.message}`;
    }
});

// Список пользователей
document.getElementById('users-list-btn').addEventListener('click', async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        document.getElementById('users-list-result').textContent = 'Сначала выполните вход';
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3002/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        if (response.ok) {
            document.getElementById('users-list-result').textContent = JSON.stringify(data, null, 2);
        } else {
            document.getElementById('users-list-result').textContent = `Ошибка: ${data.message || 'Неизвестная ошибка'}`;
        }
    } catch (error) {
        document.getElementById('users-list-result').textContent = `Ошибка: ${error.message}`;
    }
});