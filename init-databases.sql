-- Создание отдельных баз данных для каждого микросервиса
-- Согласно концепции МКС - каждый модуль обособлен

-- Auth Service Database
CREATE DATABASE quark_auth;
GRANT ALL PRIVILEGES ON DATABASE quark_auth TO quark;

-- User Service Database  
CREATE DATABASE quark_users;
GRANT ALL PRIVILEGES ON DATABASE quark_users TO quark;

-- Blog Service Database
CREATE DATABASE quark_blog;
GRANT ALL PRIVILEGES ON DATABASE quark_blog TO quark;

-- Messaging Service Database
CREATE DATABASE quark_messaging;
GRANT ALL PRIVILEGES ON DATABASE quark_messaging TO quark;

-- Media Service Database (для метаданных файлов)
CREATE DATABASE quark_media;
GRANT ALL PRIVILEGES ON DATABASE quark_media TO quark;

-- Plugin Hub Database
CREATE DATABASE quark_hub;
GRANT ALL PRIVILEGES ON DATABASE quark_hub TO quark;

-- Monitoring Database
CREATE DATABASE quark_monitoring;
GRANT ALL PRIVILEGES ON DATABASE quark_monitoring TO quark;
