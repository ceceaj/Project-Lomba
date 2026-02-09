
// ⚠️ WAJIB: Paste API KEY kamu di sini! Jangan kosong!
const API_KEY = 'AIzaSyAomf2yoDWtYc0W6lymPca1V6_jSNA4dVE'; 

// Menggunakan Model Gemini 1.5 Flash (Cepat & Stabil)
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;


// ==========================================
// 2. OTAK ROBOT (SYSTEM PROMPT - VERSI LENGKAP & GACOR)
// ==========================================
const SYSTEM_PROMPT = `
ROLE:
Kamu adalah "WRITEY" (Writeyuk Buddy), asisten virtual resmi Komunitas Writeyuk.
Tugas utamamu adalah membantu anak magang (intern), khususnya Divisi Graphic Design (GD), memahami tugas, alur kerja, dan budaya komunitas.

TONE & GAYA BICARA:
- Ramah, suportif, dan asik (seperti teman akrab tapi profesional).
- Sapaan: Gunakan "Aku" (Writey) dan "Kamu" (Buddy).
- Ringkas: Jawaban to-the-point, gunakan poin-poin agar mudah dibaca.

DATABASE PENGETAHUAN (KNOWLEDGE BASE):

1. CORE VALUES & BRANDING:
   - Nama Komunitas: "Writeyuk" (Satu kata).
   - Nama Brand (Visual): "Write Yuk" (Wajib Spasi, W & Y Kapital).
   - Slogan GD: "Visualizing Literacy, Designing Impact".
   - Sistem Kerja: Remote/Flexible, tapi deadline & meeting itu harga mati.

2. INFO VIRTUAL HQ (KANTOR):
   - WiFi: "MajuBersamaNexora" (Password: magangsejahtera).
   - Lokasi HR: Lantai 1 sebelah Pantry.

3. JADWAL MEETING (WAJIB):
   - Weekly Meeting (Umum): Kamis, 18.00 - 20.00 WIB (Zoom/GMeet).
     (Aturan: Toleransi telat 15 menit. Izin max 2x/bulan H-3).
   - Internal Meeting GD: Jumat, 19.30 WIB (Wajib hadir 100%).

4. SOP & ALUR KERJA:
   - Penamaan File: YYYYMMDD_NamaProject_Versi_Inisial (Contoh: 20260209_KontenIG_V01_AN).
   - Tools: Canva & Figma (Link setor harus "Anyone with the link can edit").
   - Setor Tugas: Upload ke Google Drive Divisi.
   - Larangan Keras: Plagiarisme.

5. ROADMAP INTERNSHIP GRAPHIC DESIGN (5 BULAN):
   - BULAN 1 (The Foundation): Adaptasi, PUEBI, & Pre-Concept Preparation.
   - BULAN 2 (Production): Produksi 4 konten edukasi (CatatYuk, KetahuiYuk) & support event.
   - BULAN 3 (Technical): Jadi Operator Zoom, database hari besar, & audit file.
   - BULAN 4 (Quality): Inovasi konsep visual baru & peer review desain teman.
   - BULAN 5 (Offboarding): Susun portofolio intern & laporan akhir.

6. ACTION CODES (VISUAL MAGIC):
   Jika user bertanya hal spesifik di bawah ini, jawab singkat lalu akhiri dengan KODE:
   - Tanya Lokasi/Denah -> [SHOW_MAP]
   - Tanya Cuti/Izin/Form -> [SHOW_CUTI]
   - Minta SOP/Dokumen -> [SHOW_SOP_PDF]
   - Minta Motivasi -> [PLAY_AUDIO_MOTIVASI]
   - Tanya Alur Kerja -> [SHOW_VIDEO_FLOWCHART]

GUARDRAILS:
- Hanya jawab seputar Writeyuk dan tugas magang.
- Jangan halusinasi (mengarang info).
- Jika tidak tahu, arahkan user tanya ke Mentor.
`;


// ==========================================
// 3. FUNGSI UTAMA (Kirim Pesan)
// ==========================================
async function sendMessage() {
    const inputField = document.getElementById('userInput');
    const userText = inputField.value.trim();

    // 1. Cek API KEY
    if (!API_KEY || API_KEY.length < 10) {
        alert("⚠️ API KEY KOSONG ATAU SALAH! Cek baris ke-7 di script.js ya!");
        return;
    }

    if (userText === "") return;

    // 2. Tampilkan Chat User
    addBubble(userText, 'user');
    
    // Reset Input
    inputField.value = ''; 
    inputField.style.height = '48px'; 

    // 3. Munculin Animasi Typing
    const typingBubble = showTypingIndicator(); 

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: SYSTEM_PROMPT + "\n\nUser bertanya: " + userText }]
                }],
                generationConfig: {
                    maxOutputTokens: 800, // Tambahin limit biar jawabannya bisa panjang & lengkap
                    temperature: 0.7
                }
            })
        });

        const data = await response.json();
        
        // Hapus Typing Indicator
        typingBubble.remove(); 

        // Cek Error dari Google
        if (data.error) {
            console.error("GOOGLE ERROR:", data.error);
            addBubble(`⚠️ Maaf Buddy, ada gangguan sistem: ${data.error.message}`, 'bot');
            return;
        }

        // Tampilkan Jawaban
        if (data.candidates && data.candidates.length > 0) {
            const aiReply = data.candidates[0].content.parts[0].text;
            addBubble(aiReply, 'bot'); 
        } else {
            addBubble("Maaf Buddy, aku lagi pusing (No Response). Coba tanya lagi ya!", 'bot');
        }

    } catch (error) {
        typingBubble.remove();
        console.error("NETWORK ERROR:", error);
        addBubble("🔥 Koneksi Putus! Cek internet kamu ya Buddy.", 'bot');
    }
}


// ==========================================
// 4. HELPER FUNCTIONS (Visual & UI)
// ==========================================

// Fungsi Klik Chip (Biar tombol saran pertanyaan jalan)
function sendQuickMessage(text) {
    const inputField = document.getElementById('userInput');
    // Set nilai input tapi langsung kirim (opsional: bisa cuma isi text aja)
    // Di sini kita langsung kirim ke fungsi sendMessage seolah user ngetik
    // Tapi kita butuh manipulasi sedikit biar fungsi sendMessage bisa baca valuenya
    inputField.value = text;
    sendMessage();
}

function addBubble(text, sender) {
    const chatBox = document.getElementById('chatBox');
    const bubble = document.createElement('div');
    bubble.className = `message ${sender}`;

    let content = formatText(text); 
    let visualElement = "";

    // --- LOGIKA VISUAL MAGIC ---
    if (text.includes("[SHOW_MAP]")) {
        content = content.replace("[SHOW_MAP]", "");
        visualElement = `
            <div class="chat-card">
                <h4>📍 Denah Kantor Lantai 1</h4>
                <img src="assets/images/denah_kantor.jpg" alt="Denah" style="width:100%; border-radius:8px; margin-top:5px;">
                <small style="color: grey; font-size: 11px;">Klik gambar untuk zoom</small>
            </div>`;
    }
    else if (text.includes("[SHOW_CUTI]")) {
        content = content.replace("[SHOW_CUTI]", "");
        visualElement = `
            <div class="chat-card">
                <h4>📄 Form Cuti Magang</h4>
                <p style="font-size:12px; margin-bottom:5px;">Isi H-3 sebelum izin ya.</p>
                <a href="assets/docs/form_cuti.pdf" download class="btn-download" style="font-size:12px; padding:6px 12px;">⬇️ Download PDF</a>
            </div>`;
    }
    else if (text.includes("[SHOW_SOP_PDF]")) {
        content = content.replace("[SHOW_SOP_PDF]", "");
        visualElement = `
            <div class="chat-card">
                <h4>📚 SOP Lengkap GD</h4>
                <a href="assets/docs/sop_lengkap.pdf" download class="btn-download" style="font-size:12px; padding:6px 12px;">⬇️ Download Dokumen</a>
            </div>`;
    }
    else if (text.includes("[PLAY_AUDIO_MOTIVASI]")) {
        content = content.replace("[PLAY_AUDIO_MOTIVASI]", "");
        visualElement = `
            <div class="chat-card">
                <h4>🎧 Semangat Pagi!</h4>
                <audio controls style="width: 100%; margin-top:5px;">
                    <source src="assets/audios/motivasi.mp4" type="audio/mpeg">
                </audio>
            </div>`;
    }
    else if (text.includes("[SHOW_VIDEO_FLOWCHART]")) {
        content = content.replace("[SHOW_VIDEO_FLOWCHART]", "");
        visualElement = `
            <div class="chat-card">
                <h4>🎬 Alur Kerja GD</h4>
                <video controls width="100%" style="border-radius:8px; margin-top:5px;">
                    <source src="assets/videos/flowchart.mp4" type="video/mp4">
                </video>
            </div>`;
    }
    
    // Masukin konten ke bubble
    bubble.innerHTML = content + visualElement;
    chatBox.appendChild(bubble);
    chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
}

function showTypingIndicator() {
    const chatBox = document.getElementById('chatBox');
    const bubble = document.createElement('div');
    bubble.className = 'typing-indicator'; 
    bubble.innerHTML = `<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>`;
    chatBox.appendChild(bubble);
    chatBox.scrollTop = chatBox.scrollHeight;
    return bubble;
}

function formatText(text) {
    if (!text) return "";
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'); // Bold
    formatted = formatted.replace(/^\* /gm, '• '); // Bullet points
    formatted = formatted.replace(/\n/g, '<br>'); // Enter
    return formatted;
}

// Auto Resize Textarea
function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

// Event Listener Enter
document.getElementById("userInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});
