# Metallurg Test Environment

🏭 Тестовая среда для системы управления производством Metallurg

![Node.js v18+](https://img.shields.io/badge/Node.js-v18+-green) ![React 18.3.1](https://img.shields.io/badge/React-18.3.1-blue) ![MySQL 8.0+](https://img.shields.io/badge/MySQL-8.0+-orange) ![Status Ready for Testing](https://img.shields.io/badge/Status-Ready%20for%20Testing-brightgreen)

## 🎯 Особенности тестовой среды

**🗄️ Упрощенная структура БД** для быстрого тестирования  
**📊 Готовые тестовые данные** через seeders  
**🔧 Упрощенная авторизация** без хэширования для удобства тестирования  
**🔒 Полная изоляция** от основного проекта  
**⚡ Быстрый старт** - готово к работе за 5 минут

## 🛠️ Технологии

**Backend:** Node.js, Express, Sequelize, MySQL, JWT  
**Frontend:** React, TypeScript, Vite, TailwindCSS  
**База данных:** MySQL 8.0+  
**Аутентификация:** JWT токены (упрощенная для тестов)

## 📦 Установка

### 1. Клонирование проекта
git clone https://github.com/Niyaz0912/metallurg-test-environment.git
cd metallurg-test-environment

### 2. Установка зависимостей
Корневые зависимости
npm install

Frontend зависимости
cd frontend && npm install

Backend зависимости
cd ../server && npm install

### 3. Настройка базы данных
CREATE DATABASE testdb;
CREATE USER 'metuser'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON testdb.* TO 'metuser'@'localhost';
FLUSH PRIVILEGES;

### 4. Конфигурация окружения
copy server.env.example server.env
Настройте `server/.env`:
DB_USERNAME=metuser
DB_PASSWORD=your_password
DB_NAME=testdb
DB_HOST=127.0.0.1
DB_DIALECT=mysql

JWT_SECRET=metallurgSecret_2024!@
NODE_ENV=development
PORT=3001

VITE_API_URL=http://localhost:3001/api

### 5. Инициализация БД
cd server
npm run migrate
npm run seed

### 6. Запуск приложения

**Backend:**
cd server
npm run dev

**Frontend (новый терминал):**
cd frontend
npm run dev

## 🔑 Тестовые пользователи

| Логин | Пароль | Роль | Описание |
|-------|--------|------|----------|
| admin | 123456 | Администратор | Полный доступ к системе |
| director | 123456 | Директор | Управление производством |
| master | 123456 | Мастер | Управление цехом |
| employee1 | 123456 | Сотрудник | Контролер качества |
| employee2 | 123456 | Сотрудник | Специалист по планированию |

## 📊 Тестовые данные

**6 департаментов:**
- Административный
- HR (Управление персоналом)
- Качества (ОТК)
- Коммерческий
- Производства
- Финансовый

**Дополнительные данные:**
- 3 техкарты с JSON спецификациями
- 6 производственных заданий
- 5 пользователей с иерархией ролей

## 🏗️ Структура проекта

