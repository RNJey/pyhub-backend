import express from 'express';
import { analyzeWithGemini } from '../controllers/aiController.js';
import db from '../config/db.js';

const router = express.Router();

// Endpoint: POST /api/ai/analyze
router.post('/analyze', analyzeWithGemini);

// Endpoint: POST /api/ai/modules_ai (UNTUK MENYIMPAN MODUL KE DATABASE)
router.post('/modules_ai', async (req, res) => {
    const { title, content } = req.body;

    try {
        // Query untuk memasukkan data ke tabel modules_ai
        const query = "INSERT INTO modules_ai (title, content) VALUES (?, ?)";
        const [result] = await db.query(query, [title, content]);

        res.status(201).json({ 
            success: true, 
            message: "Modul berhasil disimpan ke library!",
            id: result.insertId 
        });
    } catch (err) {
        console.error("Gagal menyimpan ke database:", err);
        res.status(500).json({ 
            success: false, 
            error: "Gagal menyimpan modul ke database MySQL" 
        });
    }
});

// Endpoint: GET /api/ai/modules_ai (UNTUK MENGAMBIL SEMUA MODUL)
router.get('/modules_ai', async (req, res) => {
    try {
        const query = "SELECT * FROM modules_ai ORDER BY id DESC";
        const [rows] = await db.query(query);
        
        // Kirim data dalam format { data: [...] } agar LibrarySiswa.jsx tidak error
        res.json({ data: rows });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Gagal mengambil data dari database" });
    }
});

// Endpoint: GET /api/ai/modules_ai/:id (UNTUK MENGAMBIL SATU MODUL SPESIFIK)
router.get('/modules_ai/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = "SELECT * FROM modules_ai WHERE id = ?";
        const [rows] = await db.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Modul tidak ditemukan di database" 
            });
        }

        // Kirim data dalam format yang diharapkan frontend
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        console.error("Database error detail:", err);
        res.status(500).json({ 
            success: false, 
            error: "Gagal mengambil detail modul" 
        });
    }
});

// Endpoint: DELETE /api/ai/modules_ai/:id (UNTUK MENGHAPUS MODUL)
router.delete('/modules_ai/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM modules_ai WHERE id = ?", [id]);
        res.json({ success: true, message: "Modul berhasil dihapus" });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ success: false, error: "Gagal menghapus modul" });
    }
});

export default router;