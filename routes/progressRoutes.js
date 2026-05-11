import express from 'express';
import db from '../config/db.js'; 

const router = express.Router();

// FIX: Tambahkan Endpoint GET untuk mengambil progres berdasarkan user_id dan module_id
router.get('/:user_id/:module_id', async (req, res) => {
    const { user_id, module_id } = req.params;

    try {
        const [rows] = await db.execute(
            'SELECT last_page_index, is_completed FROM users_progress WHERE user_id = ? AND module_id = ?',
            [user_id, module_id]
        );

        if (rows.length > 0) {
            // Mengirimkan data dalam properti 'data' agar sesuai dengan fetch di frontend
            return res.json({ 
                status: 'success',
                data: rows[0] 
            });
        } else {
            // Jika data belum ada, kirimkan default part 1 (index 0)
            return res.json({ 
                status: 'success',
                data: { last_page_index: 0, is_completed: 0 } 
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Endpoint: POST /api/users-progress (Sudah Benar)
router.post('/', async (req, res) => {
    const { user_id, module_id, last_page_index, is_completed, xp_earned } = req.body;

    try {
        const [existing] = await db.execute(
            'SELECT id FROM users_progress WHERE user_id = ? AND module_id = ?',
            [user_id, module_id]
        );

        if (existing.length > 0) {
            await db.execute(
                'UPDATE users_progress SET last_page_index = ?, is_completed = ?, xp_earned = ?, updated_at = NOW() WHERE user_id = ? AND module_id = ?',
                [last_page_index, is_completed ? 1 : 0, xp_earned, user_id, module_id]
            );
            return res.json({ message: 'Progress updated' });
        } else {
            await db.execute(
                'INSERT INTO users_progress (user_id, module_id, last_page_index, is_completed, xp_earned) VALUES (?, ?, ?, ?, ?)',
                [user_id, module_id, last_page_index, is_completed ? 1 : 0, xp_earned || 0]
            );
            return res.json({ message: 'Progress created' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

export default router;