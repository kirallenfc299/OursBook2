const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../db/init');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const VALID_TYPES = ['favorites', 'reading_list', 'currently_reading', 'completed'];

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { list_type } = req.query;
    let q = 'SELECT * FROM user_books WHERE user_id = $1';
    const params = [req.user.id];
    if (list_type) { q += ' AND list_type = $2'; params.push(list_type); }
    q += ' ORDER BY created_at DESC';
    const { rows } = await query(q, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { book_id, list_type, progress } = req.body;
    if (!book_id || !VALID_TYPES.includes(list_type))
      return res.status(400).json({ error: 'book_id e list_type válido são obrigatórios.' });

    await query(
      `INSERT INTO user_books (id,user_id,book_id,list_type,progress) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (user_id,book_id,list_type) DO UPDATE SET progress=EXCLUDED.progress`,
      [uuidv4(), req.user.id, book_id, list_type, progress ?? 0]
    );
    const { rows } = await query(
      'SELECT * FROM user_books WHERE user_id=$1 AND book_id=$2 AND list_type=$3',
      [req.user.id, book_id, list_type]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

router.put('/:bookId', authMiddleware, async (req, res) => {
  try {
    const { list_type, progress } = req.body;
    await query(
      'UPDATE user_books SET progress=$1 WHERE user_id=$2 AND book_id=$3 AND list_type=$4',
      [progress, req.user.id, req.params.bookId, list_type]
    );
    res.json({ message: 'Progresso atualizado.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

router.delete('/:bookId', authMiddleware, async (req, res) => {
  try {
    const { list_type } = req.query;
    let q = 'DELETE FROM user_books WHERE user_id=$1 AND book_id=$2';
    const params = [req.user.id, req.params.bookId];
    if (list_type) { q += ' AND list_type=$3'; params.push(list_type); }
    await query(q, params);
    res.json({ message: 'Removido.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

module.exports = router;
