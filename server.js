import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import progressRoutes from './routes/progressRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use((req, res, next) => {
    console.log(`${req.method} request ke ${req.url}`);
    next();
});

// FIX: Pastikan urutan pendaftaran route ini benar
app.use('/api/auth', authRoutes);         // Menangani /api/auth/login & /api/auth/me
app.use('/api/ai', aiRoutes); 
app.use('/api/profiles', profileRoutes); 
app.use('/api/users-progress', progressRoutes); // FIX: Tambahkan endpoint progress

app.get('/', (req, res) => {
    res.send('Server Pynara Running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});