// server/assignments/excelParser.js
const ExcelJS = require('exceljs');
const db = require('../models');

class AssignmentExcelParser {
  constructor() {
    // Маппинг колонок Excel на поля базы данных
    this.columnMapping = {
      'Заказчик': 'customerName',
      'Наименование заказа': 'detailName', 
      'Дата смены': 'shiftDate',
      'Тип смены': 'shiftType',
      'Логин оператора': 'operatorUsername',
      'Плановое количество': 'plannedQuantity',
      'Номер станка': 'machineNumber'
    };
  }

  async parseExcelFile(filePath) {
    const results = {
      success: [],
      errors: [],
      skipped: []
    };

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.getWorksheet(1);

      if (!worksheet) {
        throw new Error('Excel файл пуст или поврежден');
      }

      // Получаем заголовки из первой строки
      const headerRow = worksheet.getRow(1);
      const headers = [];
      headerRow.eachCell((cell, colNumber) => {
        headers[colNumber] = cell.value?.toString().trim();
      });

      console.log('📋 Заголовки Excel:', headers);

      // Обрабатываем каждую строку данных
      for (let rowNum = 2; rowNum <= worksheet.rowCount; rowNum++) {
        const row = worksheet.getRow(rowNum);
        
        // Пропускаем пустые строки
        if (row.isEmpty) {
          results.skipped.push({
            row: rowNum,
            reason: 'Пустая строка'
          });
          continue;
        }

        try {
          const rowData = await this.parseRow(row, headers, rowNum);
          const assignment = await this.createAssignment(rowData);
          
          results.success.push({
            row: rowNum,
            assignment: assignment,
            data: rowData
          });

        } catch (error) {
          results.errors.push({
            row: rowNum,
            error: error.message,
            data: this.getRowData(row, headers)
          });
        }
      }

      console.log('📊 Результаты парсинга:', {
        успешно: results.success.length,
        ошибок: results.errors.length,
        пропущено: results.skipped.length
      });

      return results;

    } catch (error) {
      console.error('❌ Ошибка парсинга Excel:', error);
      throw new Error(`Ошибка чтения Excel файла: ${error.message}`);
    }
  }

  async parseRow(row, headers, rowNum) {
    const rowData = {};

    // Извлекаем данные из каждой ячейки
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber];
      if (header && this.columnMapping[header]) {
        const fieldName = this.columnMapping[header];
        rowData[fieldName] = cell.value?.toString().trim();
      }
    });

    // Валидация обязательных полей
    const requiredFields = ['operatorUsername', 'shiftDate', 'shiftType', 'machineNumber'];
    for (const field of requiredFields) {
      if (!rowData[field]) {
        throw new Error(`Отсутствует обязательное поле: ${field}`);
      }
    }

    // Проверяем существование оператора
    const operator = await db.User.findOne({
      where: { username: rowData.operatorUsername }
    });

    if (!operator) {
      throw new Error(`Оператор не найден: ${rowData.operatorUsername}`);
    }

    // Валидация типа смены
    const shiftType = rowData.shiftType.toLowerCase();
    if (!['день', 'ночь', 'day', 'night'].includes(shiftType)) {
      throw new Error(`Неверный тип смены: ${rowData.shiftType}`);
    }

    // Преобразуем данные
    return {
      operatorId: operator.id,
      shiftDate: this.parseDate(rowData.shiftDate),
      shiftType: shiftType === 'ночь' || shiftType === 'night' ? 'night' : 'day',
      taskDescription: `Обработка деталей заказа ${rowData.detailName || 'Не указано'} для ${rowData.customerName || 'Не указан'} на станке ${rowData.machineNumber}`,
      machineNumber: rowData.machineNumber,
      detailName: rowData.detailName || 'Не указано',
      customerName: rowData.customerName || 'Не указан',
      plannedQuantity: parseInt(rowData.plannedQuantity) || 0,
      techCardId: 1,
      status: 'assigned'
    };
  }

  parseDate(dateString) {
    // Пробуем разные форматы дат
    const formats = [
      /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
      /(\d{2})\.(\d{2})\.(\d{4})/, // DD.MM.YYYY
      /(\d{2})\/(\d{2})\/(\d{4})/ // DD/MM/YYYY
    ];

    for (const format of formats) {
      const match = dateString.match(format);
      if (match) {
        if (format === formats[0]) {
          return new Date(match[1], match[2] - 1, match[3]);
        } else {
          return new Date(match[3], match[2] - 1, match[1]);
        }
      }
    }

    // Если ничего не подошло, пробуем стандартный парсинг
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(`Неверный формат даты: ${dateString}`);
    }
    
    return date;
  }

  async createAssignment(data) {
    return await db.Assignment.create(data);
  }

  getRowData(row, headers) {
    const data = {};
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber];
      if (header) {
        data[header] = cell.value?.toString().trim();
      }
    });
    return data;
  }
}

module.exports = AssignmentExcelParser;
