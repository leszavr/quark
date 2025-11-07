#!/usr/bin/env node
/**
 * Инициализация HashiCorp Vault для МКС Quark
 * Создает секреты, политики доступа и экспортирует .env.local
 */
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { randomBytes } from 'node:crypto';
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const nodeVault = require('node-vault');
/**
 * Генерирует сильный пароль
 */
function generatePassword(length = 32) {
    return randomBytes(length).toString('base64').slice(0, length);
}
/**
 * Проверяет доступность Vault
 */
async function checkVaultHealth(config) {
    const spinner = ora('Проверка доступности Vault...').start();
    for (let i = 0; i < 30; i++) {
        try {
            const response = await fetch(`${config.addr}/v1/sys/health`, {
                signal: AbortSignal.timeout(1000),
            });
            if (response.ok) {
                spinner.succeed(chalk.green('Vault доступен'));
                return true;
            }
        }
        catch {
            // Продолжаем попытки
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    spinner.fail(chalk.red('Vault недоступен'));
    console.log(chalk.yellow('💡 Убедитесь что контейнер запущен: docker compose up -d vault'));
    return false;
}
/**
 * Включает KV Secrets Engine v2
 */
async function enableKVEngine(config) {
    const spinner = ora('Включение KV Secrets Engine v2...').start();
    try {
        // Проверяем, включен ли уже
        const checkResponse = await fetch(`${config.addr}/v1/sys/mounts/secret`, {
            headers: { 'X-Vault-Token': config.token },
        });
        if (checkResponse.ok) {
            spinner.warn(chalk.yellow('KV engine уже включен'));
            return;
        }
        // Включаем KV v2
        const response = await fetch(`${config.addr}/v1/sys/mounts/secret`, {
            method: 'POST',
            headers: {
                'X-Vault-Token': config.token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'kv',
                options: { version: '2' },
            }),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
        spinner.succeed(chalk.green('KV Secrets Engine включен'));
    }
    catch (error) {
        spinner.fail(chalk.red('Ошибка включения KV engine'));
        throw error;
    }
}
/**
 * Создает секрет в Vault
 */
async function createSecret(config, path, data, name) {
    const response = await fetch(`${config.addr}/v1/secret/data/${path}`, {
        method: 'POST',
        headers: {
            'X-Vault-Token': config.token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
    });
    if (!response.ok) {
        throw new Error(`Ошибка создания ${name}: HTTP ${response.status}`);
    }
}
/**
 * Создает все секреты для МКС Quark
 */
async function createSecrets(config) {
    console.log(chalk.blue.bold('\n🔑 Создание секретов...\n'));
    const secrets = {
        dbPassword: generatePassword(32),
        jwtSecret: generatePassword(64),
        minioPassword: generatePassword(32),
        natsPassword: generatePassword(32),
    };
    const tasks = [
        {
            name: 'Database credentials',
            path: 'database',
            data: {
                host: 'postgres',
                port: 5432,
                user: 'quark',
                password: secrets.dbPassword,
                auth_db: 'quark_auth',
                blog_db: 'quark_blog',
            },
        },
        {
            name: 'JWT secrets',
            path: 'jwt',
            data: {
                secret_key: secrets.jwtSecret,
                access_token_ttl: '15m',
                refresh_token_ttl: '7d',
            },
        },
        {
            name: 'MinIO credentials',
            path: 'minio',
            data: {
                root_user: 'quark-admin',
                root_password: secrets.minioPassword,
                endpoint: 'minio:9000',
            },
        },
        {
            name: 'Redis configuration',
            path: 'redis',
            data: {
                url: 'redis://redis:6379',
                password: '',
            },
        },
        {
            name: 'NATS credentials',
            path: 'nats',
            data: {
                url: 'nats://nats:4222',
                user: 'quark',
                password: secrets.natsPassword,
            },
        },
    ];
    for (const task of tasks) {
        const spinner = ora(`  ${task.name}...`).start();
        try {
            await createSecret(config, task.path, task.data, task.name);
            spinner.succeed(chalk.green(`  ${task.name}`));
        }
        catch (error) {
            spinner.fail(chalk.red(`  ${task.name}`));
            throw error;
        }
    }
    return secrets;
}
/**
 * Создает политику доступа в Vault
 */
async function createPolicy(config, name, policy) {
    const response = await fetch(`${config.addr}/v1/sys/policy/${name}`, {
        method: 'PUT',
        headers: {
            'X-Vault-Token': config.token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ policy }),
    });
    if (!response.ok) {
        throw new Error(`Ошибка создания политики ${name}: HTTP ${response.status}`);
    }
}
/**
 * Создает политики доступа для сервисов
 */
async function createPolicies(config) {
    console.log(chalk.blue.bold('\n📋 Создание политик доступа...\n'));
    const policies = [
        {
            name: 'auth-service',
            policy: `
path "secret/data/database" { capabilities = ["read"] }
path "secret/data/jwt" { capabilities = ["read"] }
path "secret/data/redis" { capabilities = ["read"] }
`.trim(),
        },
        {
            name: 'blog-service',
            policy: `
path "secret/data/database" { capabilities = ["read"] }
path "secret/data/minio" { capabilities = ["read"] }
path "secret/data/redis" { capabilities = ["read"] }
path "secret/data/nats" { capabilities = ["read"] }
`.trim(),
        },
    ];
    for (const { name, policy } of policies) {
        const spinner = ora(`  ${name} policy...`).start();
        try {
            await createPolicy(config, name, policy);
            spinner.succeed(chalk.green(`  ${name} policy`));
        }
        catch (error) {
            spinner.fail(chalk.red(`  ${name} policy`));
            throw error;
        }
    }
}
/**
 * Экспортирует секреты в .env.local файл
 */
async function exportToEnvFile(projectRoot, config, secrets) {
    const spinner = ora('Экспорт секретов в .env.local...').start();
    const envContent = `# Автоматически сгенерированный файл из Vault
# Дата: ${new Date().toISOString()}
# ⚠️  НЕ КОММИТИТЬ В GIT!

# Vault Configuration
VAULT_ADDR=${config.addr}
VAULT_TOKEN=${config.token}

# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=quark
DB_PASSWORD=${secrets.dbPassword}
DB_AUTH_NAME=quark_auth
DB_BLOG_NAME=quark_blog

# Для docker-compose postgres container
POSTGRES_PASSWORD=${secrets.dbPassword}

# JWT
JWT_SECRET_KEY=${secrets.jwtSecret}

# MinIO
MINIO_ROOT_USER=quark-admin
MINIO_ROOT_PASSWORD=${secrets.minioPassword}

# Redis
REDIS_URL=redis://redis:6379

# NATS
NATS_URL=nats://nats:4222

# Application
NODE_ENV=development
LOG_LEVEL=debug
CORS_ORIGIN=*
`;
    try {
        const envPath = resolve(projectRoot, '.env.local');
        await writeFile(envPath, envContent, 'utf-8');
        spinner.succeed(chalk.green('.env.local создан'));
        console.log(chalk.yellow('\n⚠️  Файл .env.local создан. Убедитесь что он в .gitignore!'));
    }
    catch (error) {
        spinner.fail(chalk.red('Ошибка создания .env.local'));
        throw error;
    }
}
/**
 * Создание AppRole для production аутентификации
 */
async function createAppRole(config, projectRoot) {
    console.log(chalk.blue.bold('\n🔑 Создание AppRole для Vault Agent...\n'));
    const vault = nodeVault({
        apiVersion: 'v1',
        endpoint: config.addr,
        token: config.token,
    });
    try {
        // Включаем AppRole auth method
        const spinner1 = ora('  Enabling AppRole auth...').start();
        try {
            await vault.enableAuth({
                mount_point: 'approle',
                type: 'approle',
                description: 'AppRole for service authentication',
            });
            spinner1.succeed(chalk.green('  AppRole auth enabled'));
        }
        catch (error) {
            if (error.response?.statusCode === 400 && error.response?.body?.errors?.[0]?.includes('path is already in use')) {
                spinner1.info(chalk.yellow('  AppRole auth already enabled'));
            }
            else {
                throw error;
            }
        }
        // Создаем роль для vault-agent
        const spinner2 = ora('  Creating vault-agent role...').start();
        await vault.write('auth/approle/role/vault-agent', {
            token_ttl: '1h',
            token_max_ttl: '4h',
            policies: ['auth-service', 'blog-service'], // Доступ ко всем секретам
        });
        spinner2.succeed(chalk.green('  vault-agent role created'));
        // Получаем role-id
        const spinner3 = ora('  Fetching role-id...').start();
        const roleIdData = await vault.read('auth/approle/role/vault-agent/role-id');
        const roleId = roleIdData.data.role_id;
        spinner3.succeed(chalk.green('  role-id fetched'));
        // Генерируем secret-id
        const spinner4 = ora('  Generating secret-id...').start();
        const secretIdData = await vault.write('auth/approle/role/vault-agent/secret-id', {});
        const secretId = secretIdData.data.secret_id;
        spinner4.succeed(chalk.green('  secret-id generated'));
        // Сохраняем в volume для vault-agent (создаем директорию)
        const approleDir = resolve(projectRoot, '.vault-approle');
        await mkdir(approleDir, { recursive: true });
        await writeFile(resolve(approleDir, 'role-id'), roleId);
        await writeFile(resolve(approleDir, 'secret-id'), secretId);
        console.log(chalk.green('\n✅ AppRole credentials saved to .vault-approle/'));
        console.log(chalk.yellow('⚠️  Убедитесь что .vault-approle/ в .gitignore!\n'));
    }
    catch (error) {
        console.error(chalk.red('\n❌ Ошибка создания AppRole:'), error.message);
        throw error;
    }
}
/**
 * Отображает итоговый статус
 */
function displayStatus(config) {
    console.log(chalk.green.bold('\n✅ Vault успешно инициализирован!\n'));
    console.log(chalk.white.bold('📊 Созданные секреты:'));
    console.log('  • secret/database - Database credentials');
    console.log('  • secret/jwt - JWT signing keys');
    console.log('  • secret/minio - MinIO credentials');
    console.log('  • secret/redis - Redis configuration');
    console.log('  • secret/nats - NATS credentials');
    console.log(chalk.white.bold('\n📋 Политики доступа:'));
    console.log('  • auth-service - read: database, jwt, redis');
    console.log('  • blog-service - read: database, minio, redis, nats');
    console.log(chalk.white.bold('\n🔐 Vault UI:'));
    console.log(`   URL: ${config.addr}/ui`);
    console.log(`   Token: ${chalk.cyan(config.token)}`);
    console.log(chalk.white.bold('\n💡 Следующие шаги:'));
    console.log('   1. Обновите docker-compose.yml для использования переменных из .env.local');
    console.log('   2. Перезапустите сервисы: ./quark-manager.sh restart');
    console.log('   3. Для production используйте AppRole authentication вместо root token\n');
}
/**
 * Main CLI
 */
const program = new Command();
program
    .name('quark-vault-init')
    .description('Инициализация HashiCorp Vault с секретами для МКС Quark')
    .version('1.0.0')
    .option('-a, --addr <url>', 'Vault address', process.env.VAULT_ADDR || 'http://localhost:8200')
    .option('-t, --token <token>', 'Vault root token', process.env.VAULT_TOKEN || 'myroot')
    .option('-r, --root <path>', 'Корневая директория проекта', process.cwd())
    .option('--skip-export', 'Не создавать .env.local файл')
    .action(async (options) => {
    console.log(chalk.blue.bold('🔐 Инициализация HashiCorp Vault для МКС Quark\n'));
    console.log(`Vault Address: ${chalk.cyan(options.addr)}\n`);
    const config = {
        addr: options.addr,
        token: options.token,
    };
    try {
        // 1. Проверка доступности Vault
        const isHealthy = await checkVaultHealth(config);
        if (!isHealthy) {
            process.exit(1);
        }
        // 2. Включение KV engine
        await enableKVEngine(config);
        // 3. Создание секретов
        const secrets = await createSecrets(config);
        // 4. Создание политик
        await createPolicies(config);
        // 5. Создание AppRole для Vault Agent
        await createAppRole(config, options.root);
        // 6. Экспорт в .env.local (опционально)
        if (!options.skipExport) {
            await exportToEnvFile(options.root, config, secrets);
        }
        // 7. Итоговый статус
        displayStatus(config);
        process.exit(0);
    }
    catch (error) {
        console.error(chalk.red.bold('\n❌ Ошибка инициализации Vault:'));
        console.error(error);
        process.exit(1);
    }
});
program.parse();
//# sourceMappingURL=vault-init.js.map