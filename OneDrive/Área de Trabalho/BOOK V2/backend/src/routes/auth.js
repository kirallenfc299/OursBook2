const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query } = require('../db/init');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

function safeUser(u) {
  const { password_hash, ...rest } = u;
  return rest;
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, username } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
    if (password.length < 6)
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });

    const { rows: existing } = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.length > 0)
      return res.status(409).json({ error: 'Este email já está cadastrado.' });

    const hash = bcrypt.hashSync(password, 10);
    const sessionId = crypto.randomUUID();

    const { rows } = await query(
      `INSERT INTO users (session_id, email, username, name, password_hash, subscription_tier, is_admin)
       VALUES ($1,$2,$3,$4,$5,'basic',false) RETURNING *`,
      [sessionId, email.toLowerCase(), username || null, name, hash]
    );

    const user = rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, is_admin: user.is_admin }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'Conta criada com sucesso!', token, user: safeUser(user) });
  } catch (err) {
    console.error('[register]', err);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });

    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = rows[0];

    if (!user || !user.password_hash || !bcrypt.compareSync(password, user.password_hash))
      return res.status(401).json({ error: 'Email ou senha incorretos.' });

    const token = jwt.sign({ id: user.id, email: user.email, is_admin: user.is_admin }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: `Bem-vindo, ${user.name}!`, token, user: safeUser(user) });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(safeUser(rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// PUT /api/auth/me
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { name, avatar, subscription_tier, username } = req.body;
    await query(
      `UPDATE users SET
        name = COALESCE($1, name),
        avatar_url = COALESCE($2, avatar_url),
        subscription_tier = COALESCE($3, subscription_tier),
        username = COALESCE($4, username),
        updated_at = NOW()
       WHERE id = $5`,
      [name || null, avatar || null, subscription_tier || null, username || null, req.user.id]
    );
    const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    res.json(safeUser(rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// PUT /api/auth/me/password
router.put('/me/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias.' });
    if (newPassword.length < 6)
      return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' });

    const { rows } = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (!bcrypt.compareSync(currentPassword, rows[0].password_hash))
      return res.status(401).json({ error: 'Senha atual incorreta.' });

    const hash = bcrypt.hashSync(newPassword, 10);
    await query('UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2', [hash, req.user.id]);
    res.json({ message: 'Senha alterada com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

module.exports = router;
