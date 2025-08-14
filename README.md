# Metallurg Test Environment

🏭 Тестовая среда для системы управления производством Metallurg

![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange)
![Status](https://img.shields.io/badge/Status-Ready%20for%20Testing-brightgreen)

## 🎯 Особенности тестовой среды

- **🗄️ Упрощенная структура БД** для быстрого тестирования
- **📊 Готовые тестовые данные** через seeders
- **🔧 Адаптированные контроллеры** под тестовую БД
- **�� Полная изоляция** от основного проекта
- **⚡ Быстрый старт** - готово к работе за 5 минут

## 🛠️ Технологии

- **Backend:** Node.js, Express, Sequelize, MySQL, JWT
- **Frontend:** React, TypeScript, Vite, TailwindCSS
- **База данных:** MySQL 8.0+
- **Аутентификация:** JWT токены

## 📦 Установка

### 1. Клонирование проекта
```bash
git clone https://github.com/YOUR_USERNAME/metallurg-test-environment.git
cd metallurg-test-environment
2. Установка зависимостей
bash
# Корневые зависимости
npm install

# Frontend зависимости
cd frontend && npm install

# Backend зависимости  
cd ../server && npm install
3. Настройка базы данных
sql
CREATE DATABASE testdb;
CREATE USER 'metuser'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON testdb.* TO 'metuser'@'localhost';
FLUSH PRIVILEGES;
4. Конфигурация окружения
bash
copy server\.env.example server\.env
Настройте server/.env:

text
DB_USERNAME=metuser
DB_PASSWORD=your_password
DB_NAME=testdb
DB_HOST=127.0.0.1
DB_DIALECT=mysql

JWT_SECRET=metallurgSecret_2024!@
NODE_ENV=development
PORT=3001

VITE_API_URL=http://localhost:3001/api
5. Инициализация БД
bash
cd server
npm run migrate
npm run seed
6. Запуск приложения
Backend:

bash
cd server
npm run dev
Frontend (новый терминал):

bash
cd frontend
npm run dev
🔑 Тестовые пользователи
ЛогинПарольРольОписание
admin123456АдминистраторПолный доступ
director1123456ДиректорУправление производством
master1123456МастерМастер ОТК
employee1123456СотрудникКонтролер качества
employee2123456СотрудникСпециалист по планированию
📊 Тестовые данные
2 департамента: Администрация, ОТК

3 техкарты: с JSON спецификациями

6 заданий: производственные задачи

5 пользователей: с разными ролями

🌐 Доступ
Frontend: http://localhost:5173

Backend API: http://localhost:3001/api

🚨 Устранение проблем
Ошибка подключения к БД
Проверьте MySQL: mysql -u metuser -p

Убедитесь что БД создана

Проверьте credentials в .env

Frontend не видит backend
Убедитесь что backend на порту 3001

Проверьте VITE_API_URL в .env

📄 Лицензия
Тестовая среда для внутреннего использования.
