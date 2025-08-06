// server/generate-proper-hash.js
const bcrypt = require('bcrypt');

async function generateProperHash() {
  const password = 'password123';
  const hash = await bcrypt.hash(password, 10);
  
  console.log('🔑 ПРАВИЛЬНЫЙ хеш для пароля "password123":');
  console.log(hash);
  
  // Проверяем что он работает
  const test = await bcrypt.compare(password, hash);
  console.log('✅ Проверка хеша:', test ? 'РАБОТАЕТ' : 'НЕ РАБОТАЕТ');
  
  console.log('\n📝 SQL для создания пользователей:');
  console.log(`
INSERT INTO users (username, firstName, lastName, role, departmentId, passwordHash, phone, createdAt, updatedAt) VALUES
('Galiullin.S', 'Салават', 'Галиуллин', 'employee', 5, '${hash}', '+7-917-123-4567', NOW(), NOW()),
('Khasanov.N', 'Нияз', 'Хасанов', 'employee', 5, '${hash}', '+7-917-234-5678', NOW(), NOW()),
('Evdokimov.B', 'Борис', 'Евдокимов', 'employee', 5, '${hash}', '+7-917-345-6789', NOW(), NOW()),
('Kunitsin.D', 'Дмитрий', 'Куницын', 'employee', 5, '${hash}', '+7-917-456-7890', NOW(), NOW()),
('Latypov.O', 'Олег', 'Латыпов', 'employee', 5, '${hash}', '+7-917-567-8901', NOW(), NOW());
  `);
}

generateProperHash();
