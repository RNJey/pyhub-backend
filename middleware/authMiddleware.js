import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_kamu');
            
            req.user = decoded;
            next();
            return; // Tambahkan return agar tidak lanjut ke pengecekan !token di bawah
        } catch (error) {
            return res.status(401).json({ success: false, error: 'Token tidak valid' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Tidak ada token, akses ditolak' });
    }
};

// TAMBAHKAN BARIS INI:
export default protect;