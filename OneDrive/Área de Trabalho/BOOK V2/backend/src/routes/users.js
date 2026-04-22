const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../db/init');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

function safeUser(u) {
  const { password_hash, ...rest } = u;
  return rest;
}

router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM users ORDER BY created_at DESC');
    res.json(rows.map(safeUser));
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(safeUser(rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, email, subscription_tier, is_admin, newPassword } = req.body;
    if (newPassword) {
      if (newPassword.length < 6)
        return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres.' });
      const hash = bcrypt.hashSync(newPassword, 10);
      await query('UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2', [hash, req.params.id]);
    }
    await query(
      `UPDATE users SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        subscription_tier = COALESCE($3, subscription_tier),
        is_admin = COALESCE($4, is_admin),
        updated_at = NOW()
       WHERE id = $5`,
      [name || null, email?.toLowerCase() || null, subscription_tier || null,
       is_admin !== undefined ? is_admin : null, req.params.id]
    );
    const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    res.json(safeUser(rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    if (req.params.id === String(req.user.id))
      return res.status(400).json({ error: 'Você não pode excluir sua própria conta.' });
    await query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'Usuário excluído com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

module.exports = router;
