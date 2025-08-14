'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('🔧 Начинаем загрузку департаментов...');
      
      // Проверяем есть ли уже департаменты
      const [results] = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM departments'
      );
      
      if (results[0].count > 0) {
        console.log('⚠️ Департаменты уже существуют, пропускаем загрузку...');
        return;
      }
      
      console.log('✅ Таблица departments пустая, загружаем данные...');
      
      return await queryInterface.bulkInsert('departments', [
        {
          id: 1,
          name: 'Администрация',
          description: 'Административный департамент отвечает за общее управление предприятием, стратегическое планирование и координацию работы всех подразделений.'
        },
        {
          id: 2,
          name: 'ОТК',
          description: 'Департамент качества контролирует соответствие продукции и процессов стандартам качества, проводит внутренние аудиты и способствует постоянному улучшению.'
        },
        {
          id: 3,
          name: 'HR',
          description: 'Департамент персонала занимается подбором, обучением, развитием и увольнением сотрудников, а также обеспечивает эффективную коммуникацию внутри организации.'
        },
        {
          id: 4,
          name: 'Коммерция',
          description: 'Коммерческий департамент отвечает за маркетинг, продвижение продукции на рынке, формирование клиентской базы и заключение коммерческих договоров.'
        },
        {
          id: 5,
          name: 'Производство',
          description: 'Производственный департамент организует и контролирует процесс производства, оптимизирует ресурсы и обеспечивает выпуск качественной продукции.'
        },
        {
          id: 6,
          name: 'Финансы',
          description: 'Финансовый департамент управляет денежными потоками компании, ведет бухгалтерский учет, планирует бюджеты и контролирует доходы и расходы.'
        }
      ], {});
      
    } catch (error) {
      console.error('❌ ДЕТАЛЬНАЯ ОШИБКА в Seeder Departments:');
      console.error('Сообщение:', error.message);
      console.error('Код ошибки:', error.original?.errno);
      console.error('SQL состояние:', error.original?.sqlState);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('departments', null, {});
  }
};
