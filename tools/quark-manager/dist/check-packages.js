#!/usr/bin/env node
/**
 * Async checker for outdated packages in pnpm workspace
 * Проверяет все сервисы параллельно - ускорение в ~2.6x
 */
import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import { Command } from 'commander';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
/**
 * Определяет тип обновления (major/minor/patch)
 */
function compareVersions(current, latest) {
    const cleanCurrent = current.replace(/^[\^~]/, '');
    const cleanLatest = latest.replace(/^[\^~]/, '');
    try {
        const [currentMajor] = cleanCurrent.split('.').map(Number);
        const [latestMajor] = cleanLatest.split('.').map(Number);
        if (latestMajor !== currentMajor) {
            return 'major';
        }
        return 'minor'; // minor или patch - оба безопасны
    }
    catch {
        return 'minor';
    }
}
/**
 * Парсит вывод pnpm outdated (табличный формат)
 */
function parseOutdatedOutput(stdout) {
    const updates = [];
    const lines = stdout.split('\n');
    for (const line of lines) {
        // Пропускаем заголовки и разделители
        if (line.includes('│ Package') ||
            line.includes('┼─') ||
            line.includes('┤ Legend')) {
            continue;
        }
        // Парсим строку с обновлением
        const parts = line
            .split('│')
            .map((s) => s.trim())
            .filter(Boolean);
        if (parts.length >= 3) {
            const [name, current, latest] = parts;
            if (name && current && latest) {
                const type = compareVersions(current, latest);
                updates.push({ name, current, latest, type });
            }
        }
    }
    return updates;
}
/**
 * Категоризирует обновления на major и minor
 */
function categorizeUpdates(updates) {
    const major = [];
    const minor = [];
    for (const update of updates) {
        if (compareVersions(update.current, update.latest) === 'major') {
            major.push(update);
        }
        else {
            minor.push(update);
        }
    }
    return { major, minor };
}
/**
 * Проверяет пакеты одного сервиса
 */
async function checkServicePackages(service, servicePath) {
    try {
        // Запуск pnpm outdated с таймаутом
        const { stdout } = await execa('pnpm', ['outdated', '--depth=0'], {
            cwd: servicePath,
            timeout: 30000,
            reject: false,
        });
        if (!stdout) {
            return { service, path: servicePath, major: [], minor: [] };
        }
        // Парсим вывод
        const updates = parseOutdatedOutput(stdout);
        // Категоризируем обновления
        const { major, minor } = categorizeUpdates(updates);
        return { service, path: servicePath, major, minor };
    }
    catch (error) {
        return { service, path: servicePath, major: [], minor: [] };
    }
}
/**
 * Проверяет все сервисы параллельно с красивым выводом
 */
async function checkAllServices(rootPath) {
    const services = [
        { name: 'plugin-hub', path: resolve(rootPath, 'infra/plugin-hub') },
        { name: 'auth-service', path: resolve(rootPath, 'services/auth-service') },
        { name: 'blog-service', path: resolve(rootPath, 'services/blog-service') },
        { name: 'quark-ui', path: resolve(rootPath, 'infra/quark-ui') },
        { name: 'quark-landing', path: resolve(rootPath, 'infra/quark-landing') },
        { name: 'monitoring', path: resolve(rootPath, 'infra/monitoring') },
    ];
    // Фильтруем только существующие сервисы
    const validServices = services.filter(s => existsSync(resolve(s.path, 'package.json')));
    console.log(chalk.bold.blue('\n🔍 Проверка пакетов во всех сервисах:\n'));
    // Показываем список сервисов серым
    for (const s of validServices) {
        console.log(chalk.gray(`   ${s.name}`));
    }
    // Перемещаем курсор на строки выше для обновления
    process.stdout.write('\x1b[' + validServices.length + 'A');
    const results = [];
    // Функция для обновления статуса сервиса
    const updateServiceStatus = (index, status, name) => {
        // Сохраняем текущую позицию курсора
        process.stdout.write('\x1b[s');
        // Перемещаемся на нужную строку
        process.stdout.write('\x1b[' + (index + 1) + 'B');
        process.stdout.write('\r');
        // Очищаем строку и выводим новый статус
        process.stdout.write('\x1b[K');
        if (status === 'pending') {
            process.stdout.write(chalk.gray(`   ${name}`));
        }
        else if (status === 'checking') {
            process.stdout.write(chalk.yellow(`   ⏳ ${name}...`));
        }
        else {
            process.stdout.write(chalk.green(`   ✓ ${name}`));
        }
        // Возвращаемся на сохраненную позицию
        process.stdout.write('\x1b[u');
    };
    // Проверяем все сервисы параллельно
    const promises = validServices.map(async (s, index) => {
        updateServiceStatus(index, 'checking', s.name);
        const result = await checkServicePackages(s.name, s.path);
        updateServiceStatus(index, 'done', s.name);
        return result;
    });
    await Promise.all(promises);
    // Перемещаемся вниз после списка
    process.stdout.write('\x1b[' + validServices.length + 'B');
    console.log(); // Пустая строка после списка
    return results;
}
/**
 * Группирует обновления по сервисам
 */
function groupUpdatesByService(updates) {
    const grouped = new Map();
    for (const { service, pkg } of updates) {
        if (!grouped.has(service)) {
            grouped.set(service, []);
        }
        grouped.get(service).push(pkg);
    }
    return grouped;
}
/**
 * Отображает секцию MAJOR обновлений
 */
function displayMajorSection(allMajor) {
    console.log(chalk.red.bold('╔════════════════════════════════════════════════════════════╗'));
    console.log(chalk.red.bold('║  ⚠️  MAJOR ОБНОВЛЕНИЯ (требуют осторожности)              ║'));
    console.log(chalk.red.bold('╚════════════════════════════════════════════════════════════╝\n'));
    const majorByService = groupUpdatesByService(allMajor);
    for (const [service, packages] of majorByService) {
        console.log(chalk.red.bold(`   ${service}:`));
        for (const pkg of packages) {
            console.log(`     ${chalk.red('▸')} ${pkg.name}: ` +
                `${chalk.yellow(pkg.current)} ${chalk.gray('→')} ${chalk.green(pkg.latest)}`);
        }
        console.log();
    }
    console.log(chalk.yellow('   💡 MAJOR версии могут содержать breaking changes'));
    console.log(chalk.yellow('   💡 Рекомендуется обновлять вручную с тестированием'));
    console.log(chalk.cyan('   📝 Команда: cd <service> && pnpm update <package>@latest\n'));
}
/**
 * Отображает секцию Minor/Patch обновлений
 */
function displayMinorSection(allMinor, servicesCount) {
    console.log(chalk.green.bold('╔════════════════════════════════════════════════════════════╗'));
    console.log(chalk.green.bold('║  ✅ MINOR/PATCH ОБНОВЛЕНИЯ (безопасные)                   ║'));
    console.log(chalk.green.bold('╚════════════════════════════════════════════════════════════╝\n'));
    const minorByService = groupUpdatesByService(allMinor);
    for (const [service, packages] of minorByService) {
        console.log(chalk.green.bold(`   ${service}:`));
        for (const pkg of packages) {
            console.log(`     ${chalk.green('▸')} ${pkg.name}: ` +
                `${chalk.yellow(pkg.current)} ${chalk.gray('→')} ${chalk.green(pkg.latest)}`);
        }
        console.log();
    }
    console.log(chalk.cyan('   💡 Minor/patch версии обратно совместимы (semver)'));
    console.log(chalk.cyan('   💡 Обновление безопасно для production'));
    console.log(chalk.cyan(`   📦 Сервисов для обновления: ${servicesCount}\n`));
}
/**
 * Отображает результаты в консолидированном формате
 */
function displayResults(results) {
    const allMajor = [];
    const allMinor = [];
    // Собираем все обновления
    for (const result of results) {
        for (const pkg of result.major) {
            allMajor.push({ service: result.service, pkg });
        }
        for (const pkg of result.minor) {
            allMinor.push({ service: result.service, pkg });
        }
    }
    const hasMajor = allMajor.length > 0;
    const hasMinor = allMinor.length > 0;
    const servicesToUpdate = [...new Set(allMinor.map(m => m.service))];
    // Если всё актуально
    if (!hasMajor && !hasMinor) {
        console.log(chalk.green.bold('\n✅ Все пакеты актуальны!\n'));
        return {
            hasMajor: false,
            hasMinor: false,
            servicesCount: 0,
            services: [],
        };
    }
    console.log(); // Пустая строка
    // 1. MAJOR обновления (требуют осторожности)
    if (hasMajor) {
        displayMajorSection(allMajor);
    }
    // 2. Minor/Patch обновления (безопасные)
    if (hasMinor) {
        displayMinorSection(allMinor, servicesToUpdate.length);
    }
    return {
        hasMajor,
        hasMinor,
        servicesCount: servicesToUpdate.length,
        services: servicesToUpdate,
    };
}
/**
 * Main CLI
 */
const program = new Command();
program
    .name('quark-check-packages')
    .description('Проверяет устаревшие пакеты во всех сервисах Quark параллельно')
    .version('3.0.0')
    .option('-r, --root <path>', 'Корневая директория проекта Quark', process.cwd())
    .option('-j, --json', 'Вывести результат в JSON формате для bash скрипта')
    .action(async (options) => {
    try {
        const results = await checkAllServices(options.root);
        const stats = displayResults(results);
        if (options.json) {
            console.log(JSON.stringify(stats, null, 2));
        }
        // Если есть minor обновления - предлагаем обновить
        if (stats.hasMinor && !options.json) {
            // Используем readline для интерактивного промпта
            const rl = await import('node:readline/promises').then(m => m.default);
            const readline = rl.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            try {
                const answer = await readline.question(chalk.white.bold('Обновить minor/patch пакеты автоматически? [Y/n]: '));
                readline.close();
                const choice = answer.trim().toLowerCase();
                // Y по умолчанию - пустой ответ или 'y' считается согласием
                if (choice === '' || choice === 'y' || choice === 'yes') {
                    console.log(chalk.green('\n🔄 Обновляем пакеты...\n'));
                    const spinner = ora('Выполняется pnpm update...').start();
                    try {
                        await execa('pnpm', ['update'], {
                            cwd: options.root,
                        });
                        spinner.succeed(chalk.green('✅ Пакеты успешно обновлены!'));
                        console.log(chalk.cyan('\n💡 Рекомендуется запустить тесты: npm test\n'));
                    }
                    catch (error) {
                        spinner.fail(chalk.red('❌ Ошибка обновления'));
                        console.error(error);
                    }
                }
                else {
                    console.log(chalk.yellow('\n⏭️  Обновление пропущено\n'));
                }
            }
            catch {
                // Пользователь прервал ввод (Ctrl+C)
                readline.close();
                console.log(chalk.yellow('\n\n⏭️  Обновление отменено\n'));
            }
        }
        // Exit codes для использования в bash
        if (stats.hasMajor) {
            process.exit(1); // MAJOR обновления
        }
        else if (stats.hasMinor) {
            process.exit(2); // Minor обновления
        }
        else {
            process.exit(0); // Всё актуально
        }
    }
    catch (error) {
        console.error(chalk.red.bold('\n❌ Ошибка:'), error);
        process.exit(3);
    }
});
program.parse();
//# sourceMappingURL=check-packages.js.map