'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('🔧 Начинаем загрузку заданий...');
      
      // Проверяем есть ли уже задания
      const [results] = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM assignments'
      );
      
      if (results[0].count > 0) {
        console.log('⚠️ Задания уже существуют, пропускаем загрузку...');
        console.log(`📋 Найдено заданий: ${results[0].count}`);
        return;
      }
      
      console.log('✅ Таблица assignments пустая, загружаем тестовые задания...');
      
      return await queryInterface.bulkInsert('assignments', [
        {
          id: 1,
          operatorId: 4, // employee1 - Алексей Иванов (контролер качества)
          shiftDate: new Date('2024-08-14'),
          taskDescription: 'Токарная обработка корпуса подшипникового узла. Выполнить обтачивание наружных поверхностей согласно чертежу. Контроль размеров каждые 10 деталей.',
          machineNumber: 'ТС-101',
          detailName: 'Корпус подшипникового узла',
          customerName: 'ООО Транспортные системы',
          plannedQuantity: 50,
          actualQuantity: 35, // Смена еще не закончена
          techCardId: 1, // Ссылка на техкарту корпуса
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          operatorId: 5, // employee2 - Михаил Козлов (специалист по планированию)
          shiftDate: new Date('2024-08-14'),
          taskDescription: 'Расточка отверстий в роликовом механизме под подшипники 6204. Обеспечить точность посадочных мест. Проверка калибрами после каждой детали.',
          machineNumber: 'РС-205',
          detailName: 'Роликовый механизм',
          customerName: 'АО Машиностроение',
          plannedQuantity: 25,
          actualQuantity: 25, // Задание выполнено
          techCardId: 2, // Ссылка на техкарту роликового механизма
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 3,
          operatorId: 4, // employee1 - Алексей Иванов
          shiftDate: new Date('2024-08-13'),
          taskDescription: 'Динамическая балансировка приводного вала. Класс точности G6.3. После балансировки - маркировка и упаковка для отправки заказчику.',
          machineNumber: 'БС-301',
          detailName: 'Приводной вал',
          customerName: 'ПАО Логистика',
          plannedQuantity: 15,
          actualQuantity: 15, // Задание выполнено полностью
          techCardId: 3, // Ссылка на техкарту приводного вала
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 4,
          operatorId: 5, // employee2 - Михаил Козлов
          shiftDate: new Date('2024-08-15'), // Завтрашнее задание
          taskDescription: 'Фрезерование наружных поверхностей корпуса. Черновая и чистовая обработка. Особое внимание к шероховатости поверхности Ra 3.2.',
          machineNumber: 'ФС-102',
          detailName: 'Корпус подшипникового узла',
          customerName: 'ООО Транспортные системы',
          plannedQuantity: 40,
          actualQuantity: null, // Задание еще не начато
          techCardId: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 5,
          operatorId: 4, // employee1 - Алексей Иванов
          shiftDate: new Date('2024-08-12'), // Вчерашнее задание
          taskDescription: 'Контроль качества готовых роликовых механизмов. Проверка размеров, зазоров подшипников, тестирование на стенде. Оформление протокола контроля.',
          machineNumber: 'КС-401',
          detailName: 'Роликовый механизм',
          customerName: 'АО Машиностроение',
          plannedQuantity: 30,
          actualQuantity: 28, // 2 детали забракованы
          techCardId: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 6,
          operatorId: 3, // master1 - Сергей Сидоров (мастер)
          shiftDate: new Date('2024-08-14'),
          taskDescription: 'Настройка токарного станка ТС-101 для обработки новой партии валов. Проверка инструмента, корректировка программы ЧПУ, первая деталь на контроль.',
          machineNumber: 'ТС-101',
          detailName: 'Приводной вал',
          customerName: 'ЗАО Металлургия',
          plannedQuantity: 5, // Настроечная партия
          actualQuantity: 3, // В процессе настройки
          techCardId: 3,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], {});
      
    } catch (error) {
      console.error('❌ ДЕТАЛЬНАЯ ОШИБКА в Assignments Seeder:');
      console.error('Сообщение:', error.message);
      console.error('Тип ошибки:', error.name);
      if (error.original) {
        console.error('Код ошибки:', error.original.errno);
        console.error('SQL сообщение:', error.original.sqlMessage);
      }
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('assignments', null, {});
  }
};
