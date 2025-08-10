// server/techCards/index.js
const routes = require('./techCardRoutes');
const controller = require('./techCardController');

const moduleInfo = {
  name: 'TechCards',
  version: '2.0.0',
  description: 'Упрощенный модуль технологических карт',
  features: [
    'Упрощенное создание техкарт (customer, order, product, quantity, PDF)',
    'Автоматическое логирование просмотров и работы',
    'Простая фиксация работы операторов',
    'История доступов для аналитики'
  ],
  endpoints: {
    'GET /': 'Список всех техкарт',
    'POST /': 'Создание техкарты (5 полей)',
    'GET /:id': 'Просмотр техкарты (с автологированием)',
    'PUT /:id': 'Обновление техкарты', 
    'DELETE /:id': 'Удаление техкарты',
    'POST /:id/executions': 'Фиксация работы оператора',
    'POST /:id/upload-pdf': 'Загрузка PDF файла',
    'GET /:id/accesses': 'История доступов'
  }
};

module.exports = {
  routes,
  controller,
  info: moduleInfo
};

