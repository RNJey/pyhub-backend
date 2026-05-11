import db from '../config/db.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    const { email, password, full_name, major } = req.body;
    const userId = uuidv4(); 

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.query(
            'INSERT INTO users (id, email, password) VALUES (?, ?, ?)',
            [userId, email, hashedPassword]
        );

        await db.query(
            'INSERT INTO profiles (id, full_name, major, level, xp) VALUES (?, ?, ?, ?, ?)',
            [userId, full_name, major, 1, 0]
        );

        res.status(201).json({ success: true, message: "User berhasil terdaftar!" });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, error: "User tidak ditemukan" });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, error: "Password salah" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'secret_key_kamu',
            { expiresIn: '1d' }
        );

        res.json({ 
            success: true, 
            message: "Login berhasil", 
            token,
            user: { id: user.id, email: user.email } 
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// TAMBAHKAN FUNGSI INI UNTUK FIX ERROR 404 /ME
export const getMe = async (req, res) => {
    try {
        // req.user diisi oleh middleware protect dari token JWT
        const query = `
            SELECT u.id, u.email, p.full_name, p.major, p.level, p.xp 
            FROM users u 
            JOIN profiles p ON u.id = p.id 
            WHERE u.id = ?
        `;
        
        const [rows] = await db.query(query, [req.user.id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: "Profil tidak ditemukan" });
        }

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("GetMe Error:", error);
        res.status(500).json({ success: false, error: "Gagal mengambil data profil" });
    }
};