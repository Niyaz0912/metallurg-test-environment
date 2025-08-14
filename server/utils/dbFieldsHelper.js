// server/utils/dbFieldsHelper.js
const { sequelize } = require('../models');

const checkTableFields = async (tableName) => {
  try {
    const [results] = await sequelize.query(
      `DESCRIBE ${tableName}`
    );
    return results.map(row => row.Field);
  } catch (error) {
    console.error(`Ошибка проверки полей таблицы ${tableName}:`, error);
    return [];
  }
};

const getAvailableFields = (requestedFields, availableFields) => {
  return requestedFields.filter(field => availableFields.includes(field));
};

module.exports = {
  checkTableFields,
  getAvailableFields
};
