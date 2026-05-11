import dotenv from 'dotenv';

dotenv.config();

export const analyzeWithGemini = async (req, res) => {
    try {
        // Mengambil key dari backend/.env (tanpa VITE_)
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ success: false, error: "GEMINI_API_KEY tidak ditemukan di file backend/.env" });
        }

        const { text: extractedText } = req.body;

        if (!extractedText) {
            return res.status(400).json({ success: false, error: "Tidak ada teks yang diekstrak dari PDF." });
        }

        // Membersihkan dan membatasi panjang teks PDF agar tidak melebihi limit token
        const cleanText = extractedText.slice(0, 15000).replace(/\s+/g, ' ');

        const systemPrompt = `Anda adalah Pynara, asisten AI pakar Python untuk siswa SMK. 
Tugas Anda adalah merangkum materi Pemrograman Berorientasi Objek (PBO) dari teks PDF menjadi modul belajar dalam format JSON murni.

STRATEGI KONTEN:
1. Analogi: Gunakan dunia nyata (Game RPG, Motor, HP). Sapaan: "Bro/Sis".
2. Struktur Materi: Pecah menjadi 3-5 halaman (pages).
3. Evaluasi: Tambahkan 5 soal pilihan ganda di akhir modul.

WAJIB MENGIKUTI STRUKTUR JSON BERIKUT:
{
  "id": 99,
  "title": "Judul Modul (String)",
  "pages": [
    {
      "subtitle": "Subjudul Halaman",
      "youtubeId": null,
      "content": [
        {
          "text": "Penjelasan konsep (Boleh pakai Markdown)",
          "code": "Contoh kode Python (atau null)"
        }
      ],
      "mission": "Instruksi tugas praktikum",
      "defaultCode": "Template kode awal",
      "check": "String kunci validasi jawaban",
      "answerCode": "Solusi kode yang benar",
      "successMsg": "Pesan motivasi",
      "voiceSummary": "Ringkasan 2 kalimat"
    }
  ],
  "evaluation": [
    {
      "question": "Pertanyaan soal",
      "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
      "answer": 0
    }
  ]
}`;

        // Memanggil Gemini 1.5 Flash API via REST fetch
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                },
                contents: [
                    {
                        role: "user",
                        parts: [{ text: `Teks PDF: "${cleanText}". Buatlah satu modul lengkap dengan format JSON tersebut.` }]
                    }
                ],
                generationConfig: {
                    temperature: 0.3,
                    responseMimeType: "application/json" // KUNCI: Memaksa Gemini output JSON murni tanpa markdown
                }
            })
        });

        const data = await response.json();

        // Jika API Google menolak/error
        if (!response.ok) {
            console.error("Gemini API Error:", data);
            throw new Error(data.error?.message || "Gagal memanggil Gemini API");
        }

        // Mengekstrak hasil JSON dari respon Gemini
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiResponse) {
            throw new Error("AI Gemini tidak memberikan respon yang valid.");
        }

        // Parsing untuk memastikan teks yang keluar benar-benar JSON yang bisa dipakai React
        const parsedData = JSON.parse(aiResponse);

        res.json({ 
            success: true, 
            data: parsedData 
        });

    } catch (error) {
        console.error("AI Analysis Error:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message || "Terjadi kesalahan saat AI memproses materi PDF." 
        });
    }
};