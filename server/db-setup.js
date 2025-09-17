const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class DatabaseSetup {
  constructor() {
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 секунд
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async runCommand(command, description, retries = this.maxRetries) {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`🔄 ${description} (attempt ${i + 1}/${retries})`);
        
        const { stdout, stderr } = await execAsync(command, { 
          cwd: __dirname,
          timeout: 120000, // 2 минуты таймаут
          env: { 
            ...process.env,
            NODE_ENV: process.env.NODE_ENV || 'production'
          }
        });
        
        if (stdout) {
          console.log(stdout);
        }
        
        if (stderr && !stderr.includes('warn')) {
          console.log('⚠️ Warnings:', stderr);
        }
        
        console.log(`✅ ${description} completed successfully`);
        return { success: true, output: stdout };
        
      } catch (error) {
        console.error(`❌ ${description} failed (attempt ${i + 1}):`, error.message);
        
        if (i < retries - 1) {
          console.log(`⏳ Retrying in ${this.retryDelay / 1000} seconds...`);
          await this.sleep(this.retryDelay);
        }
      }
    }
    
    throw new Error(`${description} failed after ${retries} attempts`);
  }

  async checkDatabaseConnection() {
    console.log('🔍 Testing database connection...');
    
    try {
      const { Sequelize } = require('sequelize');
      const config = require('./config/config');
      const env = process.env.NODE_ENV || 'production';
      
      const sequelize = new Sequelize(config[env]);
      await sequelize.authenticate();
      await sequelize.close();
      
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }

  async runMigrations() {
    console.log('📦 Checking and running migrations...');
    
    try {
      // Проверяем статус миграций
      const statusResult = await this.runCommand(
        'npx sequelize-cli db:migrate:status',
        'Checking migration status',
        1 // Только одна попытка для проверки статуса
      );
      
      // Запускаем миграции (безопасно - не выполнит уже примененные)
      await this.runCommand(
        'npx sequelize-cli db:migrate',
        'Running database migrations'
      );
      
      console.log('✅ All migrations completed');
      
    } catch (error) {
      console.error('❌ Migration process failed:', error.message);
      throw error;
    }
  }

  async runSeeders() {
    console.log('🌱 Checking if seeding is needed...');
    
    try {
      const needsSeeding = await this.checkIfSeedingNeeded();
      
      if (needsSeeding) {
        console.log('📦 Database needs seeding, running seeders...');
        await this.runCommand(
          'npx sequelize-cli db:seed:all',
          'Running database seeders'
        );
        console.log('✅ Database seeding completed');
      } else {
        console.log('✅ Database already has data, skipping seeders');
      }
      
    } catch (error) {
      console.error('❌ Seeding process failed:', error.message);
      // Не бросаем ошибку для сидеров - это не критично
      console.log('⚠️ Continuing without seeders...');
    }
  }

  async checkIfSeedingNeeded() {
    try {
      const { Sequelize } = require('sequelize');
      const config = require('./config/config');
      const env = process.env.NODE_ENV || 'production';
      
      const sequelize = new Sequelize(config[env]);
      
      // Проверяем ключевые таблицы на наличие данных
      const checkQueries = [
        { table: 'users', query: 'SELECT COUNT(*) as count FROM users' },
        { table: 'departments', query: 'SELECT COUNT(*) as count FROM departments' }
      ];
      
      for (const check of checkQueries) {
        try {
          const [results] = await sequelize.query(check.query);
          const count = results[0].count;
          
          console.log(`📊 Found ${count} records in ${check.table} table`);
          
          if (count > 0) {
            await sequelize.close();
            console.log(`✅ Data exists in ${check.table}, no seeding needed`);
            return false;
          }
        } catch (error) {
          console.log(`⚠️ Could not check ${check.table} table:`, error.message);
        }
      }
      
      await sequelize.close();
      console.log('📦 No data found in key tables, seeding is needed');
      return true;
      
    } catch (error) {
      console.log('⚠️ Could not verify seeding status:', error.message);
      console.log('🎯 Will attempt seeding to be safe');
      return true;
    }
  }

  async setupDatabase() {
    console.log('🚀 === DATABASE SETUP STARTED ===');
    
    try {
      // 1. Проверяем подключение к базе данных
      await this.checkDatabaseConnection();
      
      // 2. Выполняем миграции
      await this.runMigrations();
      
      // 3. Выполняем сидинг при необходимости
      await this.runSeeders();
      
      console.log('✅ === DATABASE SETUP COMPLETED SUCCESSFULLY ===');
      
    } catch (error) {
      console.error('❌ === DATABASE SETUP FAILED ===');
      console.error('Error details:', error.message);
      throw error;
    }
  }
}

module.exports = DatabaseSetup;
