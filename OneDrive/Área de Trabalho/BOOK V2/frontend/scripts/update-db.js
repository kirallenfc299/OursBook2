const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'oursbook.db');

console.log('📦 Atualizando banco de dados...');
console.log('📍 Caminho:', DB_PATH);

const db = new Database(DB_PATH);

try {
  // 1. Verificar se coluna username existe
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  const hasUsername = tableInfo.some(col => col.name === 'username');

  if (!hasUsername) {
    console.log('🔄 Adicionando coluna username...');
    
    // Criar tabela temporária com a nova estrutura
    db.exec(`
      CREATE TABLE users_new (
        id                TEXT PRIMARY KEY,
        email             TEXT UNIQUE NOT NULL,
        username          TEXT UNIQUE,
        name              TEXT NOT NULL,
        password          TEXT NOT NULL,
        avatar            TEXT,
        subscription_tier TEXT NOT NULL DEFAULT 'basic'
                            CHECK(subscription_tier IN ('basic','premium','ultimate')),
        is_admin          INTEGER NOT NULL DEFAULT 0,
        created_at        TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    // Copiar dados da tabela antiga
    db.exec(`
      INSERT INTO users_new (id, email, name, password, avatar, subscription_tier, is_admin, created_at, updated_at)
      SELECT id, email, name, password, avatar, subscription_tier, is_admin, created_at, updated_at
      FROM users;
    `);

    // Remover tabela antiga e renomear nova
    db.exec(`DROP TABLE users;`);
    db.exec(`ALTER TABLE users_new RENAME TO users;`);

    console.log('✅ Coluna username adicionada');
  } else {
    console.log('ℹ️  Coluna username já existe');
  }

  // 2. Tornar ytalosave@gmail.com administrador
  const result = db.prepare(`
    UPDATE users 
    SET is_admin = 1, subscription_tier = 'ultimate'
    WHERE email = ?
  `).run('ytalosave@gmail.com');

  if (result.changes > 0) {
    console.log('✅ ytalosave@gmail.com agora é administrador com plano Ultimate');
  } else {
    console.log('⚠️  Email ytalosave@gmail.com não encontrado no banco de dados');
  }

  // 3. Mostrar todos os usuários
  const users = db.prepare('SELECT id, email, username, name, is_admin, subscription_tier FROM users').all();
  console.log('\n📋 Usuários no banco de dados:');
  users.forEach(user => {
    console.log(`  - ${user.email} (${user.name})`);
    console.log(`    Username: ${user.username || '(não definido)'}`);
    console.log(`    Admin: ${user.is_admin ? 'Sim' : 'Não'}`);
    console.log(`    Plano: ${user.subscription_tier}`);
    console.log('');
  });

  console.log('✅ Atualização concluída!');
} catch (err) {
  console.error('❌ Erro ao atualizar banco de dados:', err);
  process.exit(1);
} finally {
  db.close();
}
