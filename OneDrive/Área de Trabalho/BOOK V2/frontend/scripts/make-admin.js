const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'oursbook.db');

console.log('📂 Opening database:', DB_PATH);

const db = new Database(DB_PATH);

// Check if user exists
const user = db.prepare('SELECT * FROM users WHERE email = ?').get('ytalosave@gmail.com');

if (!user) {
  console.log('❌ User ytalosave@gmail.com not found in database');
  console.log('Please register this user first, then run this script again.');
  process.exit(1);
}

console.log('✅ User found:', user.name, '(', user.email, ')');
console.log('Current admin status:', user.is_admin === 1 ? 'YES' : 'NO');

if (user.is_admin === 1) {
  console.log('✅ User is already an admin!');
  process.exit(0);
}

// Make user admin
db.prepare('UPDATE users SET is_admin = 1, subscription_tier = ? WHERE email = ?')
  .run('ultimate', 'ytalosave@gmail.com');

console.log('✅ User ytalosave@gmail.com is now an admin with Ultimate subscription!');

// Verify
const updatedUser = db.prepare('SELECT * FROM users WHERE email = ?').get('ytalosave@gmail.com');
console.log('Verified - Admin status:', updatedUser.is_admin === 1 ? 'YES' : 'NO');
console.log('Verified - Subscription:', updatedUser.subscription_tier);

db.close();
