import mysql from 'mysql2/promise'; // импорт mysql2 с поддержкой promise

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'metuser',
  password: 'Alim@3011',
  database: 'metallurg'
});

try {
  const [rows] = await connection.execute('SELECT 1 + 1 AS solution');
  console.log('Результат запроса:', rows[0].solution);
} catch (error) {
  console.error('Ошибка запроса:', error);
} finally {
  await connection.end();
}

