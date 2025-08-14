Система управления производством
Корпоративная система для цифровизации производственных процессов на промышленном предприятии. Включает управление техническими картами, сменными заданиями, планами производства и корпоративной базой знаний.

Описание
Веб-приложение предназначено для:

Управления техническими картами с возможностью просмотра PDF

Распределения и контроля сменных заданий для операторов

Планирования производственных процессов

Работы с департаментальными порталами (6 департаментов)

Ведения корпоративной базы знаний

Управления пользователями и ролями (admin, director, master, employee)

Технологии
Frontend:

React 18 + TypeScript

Vite 5

TailwindCSS 3

React Router 7

PDF.js для просмотра документов

Backend:

Node.js + Express.js 4

Sequelize 6 ORM + MySQL

JWT аутентификация

Multer для загрузки файлов

ExcelJS для работы с Excel

База данных:

MySQL 8.0+

25+ миграций

Начальные данные через seeders

Установка:

Требования
Node.js 18+

MySQL 8.0+

Git

Команды установки:

# Клонирование репозитория
git clone https://github.com/Niyaz0912/project.git
cd project

# Установка зависимостей
npm install
npm install --prefix frontend
npm install --prefix server

# Создание базы данных MySQL
mysql -u root -p
CREATE DATABASE your_database_name CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'your_username'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON your_database_name.* TO 'your_username'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Настройка переменных окружения
cp server/.env.example server/.env
# Отредактируйте server/.env файл с вашими настройками базы данных

# Применение миграций и заполнение данными
cd server
npm run migrate
npm run seed

# После выполнения команд в системе будут созданы:
# - 6 департаментов (Производство, ОТК, Коммерция, HR, Финансы, Администрация)
# - Тестовые пользователи (admin@company.com, master@company.com, operator@company.com)
# - Образцы техкарт и планов производства
# - Примеры сменных заданий
# Пароль для всех тестовых пользователей: 123456

# Запуск приложения
# Терминал 1 - Backend (порт 3001)
cd server
npm run dev

# Терминал 2 - Frontend (порт 5173)
cd frontend
npm run dev
