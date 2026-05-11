import db from '../config/db.js';

export const getProfileById = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM profiles WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Profile not found" });
        }
        res.json({ data: rows[0] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    // FIX: Tangkap semua data yang dikirimkan oleh Frontend
    const { xp, completed_modules, current_module_id, streak, last_login } = req.body;
    
    try {
        const [current] = await db.execute('SELECT * FROM profiles WHERE id = ?', [req.params.id]);
        if (current.length === 0) return res.status(404).json({ message: "Profile not found" });

        const profileDB = current[0];

        // 1. Logika XP & Level Up
        let newXP = xp !== undefined ? Number(xp) : profileDB.xp;
        let newLevel = Number(profileDB.level);
        
        while (newXP >= newLevel * 100) {
            newXP -= (newLevel * 100);
            newLevel += 1;
        }

        // 2. Ambil data baru jika dikirim, jika tidak ada gunakan data lama di DB
        const newCompletedModules = completed_modules !== undefined ? completed_modules : profileDB.completed_modules;
        const newCurrentModuleId = current_module_id !== undefined ? current_module_id : profileDB.current_module_id;
        const newStreak = streak !== undefined ? streak : profileDB.streak;
        const newLastLogin = last_login !== undefined ? last_login : profileDB.last_login;

        // 3. Simpan SEMUANYA ke tabel profiles
        await db.execute(
            `UPDATE profiles SET 
                xp = ?, 
                level = ?, 
                completed_modules = ?, 
                current_module_id = ?, 
                streak = ?, 
                last_login = ? 
            WHERE id = ?`,
            [
                newXP, 
                newLevel, 
                newCompletedModules, 
                newCurrentModuleId, 
                newStreak, 
                newLastLogin, 
                req.params.id
            ]
        );
        
        res.json({ 
            message: "Progress updated successfully",
            data: { 
                xp: newXP, 
                level: newLevel,
                completed_modules: newCompletedModules,
                current_module_id: newCurrentModuleId
            } 
        });
    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ message: error.message });
    }
};