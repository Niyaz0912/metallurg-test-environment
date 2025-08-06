// server/assignments/excelParser.js
const ExcelJS = require('exceljs');
const db = require('../models');

class AssignmentExcelParser {
  constructor() {
    this.requiredColumns = [
      'Заказчик',
      'Наименование заказа', 
      'Дата смены',
      'Тип смены',
      'Логин оператора',
      'Плановое количество',
      'Номер станка'
    ];
  }

  async parseExcelFile(filePath, uploadedBy) {
    try {
      console.log('🔄 Парсинг Excel файла:', filePath);
      
      // Создаем экземпляр workbook
      const workbook = new ExcelJS.Workbook();
      
      // Читаем Excel файл
      await workbook.xlsx.readFile(filePath);
      
      // Получаем первый лист
      const worksheet = workbook.getWorksheet(1);
      
      if (!worksheet) {
        throw new Error('Excel файл не содержит листов с данными');
      }

      console.log(`📋 Обрабатываем лист: "${worksheet.name}"`);

      // Получаем заголовки из первой строки
      const headerRow = worksheet.getRow(1);
      const headers = [];
      
      headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        headers[colNumber] = cell.text || cell.value;
      });

      console.log('📝 Найденные заголовки:', headers);

      // Валидируем наличие обязательных колонок
      this.validateHeaders(headers);

      // Получаем индексы колонок
      const columnIndexes = this.getColumnIndexes(headers);

      // Обрабатываем строки данных (начиная со 2-й строки)
      const results = {
        success: [],
        errors: [],
        skipped: []
      };

      let processedRows = 0;
      
      // Перебираем строки начиная с 2-й
      worksheet.eachRow({ includeEmpty: false }, async (row, rowNumber) => {
        // Пропускаем заголовок
        if (rowNumber === 1) return;
        
        try {
          const rowData = this.extractRowData(row, columnIndexes);
          
          if (this.isEmptyRow(rowData)) {
            results.skipped.push({
              row: rowNumber,
              reason: 'Пустая строка или отсутствуют ключевые данные'
            });
            return;
          }

          const assignment = await this.processRowData(rowData, rowNumber);
          
          if (assignment) {
            results.success.push({
              row: rowNumber,
              operator: assignment.operatorUsername,
              machine: assignment.machineNumber,
              assignmentId: assignment.id
            });
          } else {
            results.skipped.push({
              row: rowNumber,
              reason: 'Не удалось создать задание'
            });
          }
          
          processedRows++;
          
        } catch (error) {
          results.errors.push({
            row: rowNumber,
            error: error.message,
            data: this.extractRowData(row, columnIndexes, true) // безопасное извлечение для отладки
          });
        }
      });

      console.log(`✅ Обработка завершена. Строк обработано: ${processedRows}`);
      console.log('📊 Результаты:', {
        успешно: results.success.length,
        ошибки: results.errors.length,
        пропущено: results.skipped.length
      });

      return results;

    } catch (error) {
      console.error('❌ Ошибка парсинга Excel:', error);
      throw error;
    }
  }

  validateHeaders(headers) {
    const availableHeaders = Object.values(headers).filter(h => h && h.trim());
    const missingColumns = this.requiredColumns.filter(col => 
      !availableHeaders.some(header => header.includes(col))
    );
    
    if (missingColumns.length > 0) {
      throw new Error(`Отсутствуют обязательные колонки: ${missingColumns.join(', ')}`);
    }
  }

  getColumnIndexes(headers) {
    const indexes = {};
    
    Object.entries(headers).forEach(([colIndex, header]) => {
      if (!header) return;
      
      const headerText = header.toString().trim();
      
      this.requiredColumns.forEach(requiredCol => {
        if (headerText.includes(requiredCol)) {
          indexes[requiredCol] = parseInt(colIndex);
        }
      });
    });

    return indexes;
  }

  extractRowData(row, columnIndexes, safe = false) {
    const data = {};
    
    Object.entries(columnIndexes).forEach(([columnName, colIndex]) => {
      try {
        const cell = row.getCell(colIndex);
        
        // Получаем значение ячейки
        let value = cell.value;
        
        // Обрабатываем разные типы данных
        if (value === null || value === undefined) {
          data[columnName] = '';
        } else if (typeof value === 'object' && value.text) {
          // Для форматированного текста
          data[columnName] = value.text;
        } else if (value instanceof Date) {
          // Для дат
          data[columnName] = value.toISOString().split('T')[0];
        } else {
          data[columnName] = value.toString().trim();
        }
        
      } catch (error) {
        if (!safe) {
          console.warn(`Ошибка чтения ячейки ${colIndex} в строке ${row.number}:`, error.message);
        }
        data[columnName] = '';
      }
    });

    return data;
  }

  isEmptyRow(rowData) {
    const keyFields = ['Логин оператора', 'Номер станка'];
    return keyFields.every(field => !rowData[field] || rowData[field].trim() === '');
  }

  async processRowData(rowData, rowNumber) {
    // Ищем пользователя по логину
    const operatorUsername = rowData['Логин оператора'];
    const operator = await db.User.findOne({
      where: { username: operatorUsername }
    });

    if (!operator) {
      throw new Error(`Пользователь с логином "${operatorUsername}" не найден`);
    }

    // Обрабатываем дату смены
    let shiftDate = rowData['Дата смены'];
    if (!shiftDate || shiftDate === '') {
      // Используем последнюю известную дату или текущую
      shiftDate = this.lastKnownDate || new Date().toISOString().split('T')[0];
    } else {
      this.lastKnownDate = shiftDate;
    }

    // Нормализуем тип смены
    const shiftTypeText = rowData['Тип смены'].toLowerCase();
    const shiftType = shiftTypeText.includes('ночь') || shiftTypeText.includes('night') ? 'night' : 'day';

    // Получаем остальные данные
    const customerName = rowData['Заказчик'] || 'Не указан';
    const orderName = rowData['Наименование заказа'] || 'Не указан';
    const machineNumber = rowData['Номер станка'];
    const plannedQuantity = parseInt(rowData['Плановое количество']) || 0;

    // Генерируем описание задачи
    const taskDescription = `Обработка деталей заказа "${orderName}" для заказчика "${customerName}" на станке ${machineNumber}`;

    try {
      // Создаем задание в базе данных
      const assignment = await db.Assignment.create({
        operatorId: operator.id,
        shiftDate: new Date(shiftDate),
        shiftType: shiftType,
        taskDescription: taskDescription,
        machineNumber: machineNumber,
        detailName: orderName,
        customerName: customerName,
        plannedQuantity: plannedQuantity,
        techCardId: 1, // Временно, потом можно связать с реальными техкартами
        status: 'assigned'
      });

      // Добавляем дополнительную информацию для отчета
      assignment.operatorUsername = operatorUsername;

      return assignment;
      
    } catch (dbError) {
      throw new Error(`Ошибка сохранения в БД: ${dbError.message}`);
    }
  }
}

module.exports = AssignmentExcelParser;
