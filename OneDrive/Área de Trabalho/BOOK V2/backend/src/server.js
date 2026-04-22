require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initSchema } = require('./db/init');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

async function boot() {
  await initSchema();

  const authRoutes     = require('./routes/auth');
  const usersRoutes    = require('./routes/users');
  const userBooksRoutes = require('./routes/userBooks');

  app.use('/api/auth',       authRoutes);
  app.use('/api/users',      usersRoutes);
  app.use('/api/user-books', userBooksRoutes);

  app.listen(PORT, () => {
    console.log(`\n🚀 OursBook API em http://localhost:${PORT}`);
    console.log(`📊 Banco: PostgreSQL local (oursbook)\n`);
  });
}

boot().catch(err => {
  console.error('❌ Falha ao iniciar:', err.message);
  process.exit(1);
});
