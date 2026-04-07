// จัดการการเข้าสู่ระบบ (Login) - แบบไม่มีรหัสผ่านฝังในโค้ด 
async function handleAuthSubmit(event, type) {
    event.preventDefault();
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = 'ประมวลผล...'; [cite: 412]

    if (type === 'login') {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value; [cite: 413]

        const { data, error } = await supabaseClient.auth.signInWithPassword({ 
            email: email, 
            password: password 
        }); [cite: 416]

        if (error) {
            alert('❌ อีเมลหรือรหัสผ่านไม่ถูกต้อง'); [cite: 419]
        } else {
            alert('✅ เข้าสู่ระบบสำเร็จ');
            closeAuthModal(); [cite: 419]
            // ระบบจะไปเรียก updateUIAuth อัตโนมัติจาก onAuthStateChange [cite: 217]
        }
    } 
    // ... ส่วนของ Register คงเดิม [cite: 420]
    submitBtn.innerText = originalText; [cite: 428]
}

// ตรวจสอบสิทธิ์และอัปเดตหน้าตาเว็บ [cite: 218]
function updateUIAuth(session) {
    currentUserSession = session;
    const isLoggedIn = session !== null; [cite: 218]
    
    // จัดการเมนูตามสถานะการล็อกอิน [cite: 219]
    document.getElementById('guestMenu').style.display = isLoggedIn ? 'none' : 'flex';
    document.getElementById('loggedInMenu').style.display = isLoggedIn ? 'flex' : 'none'; [cite: 219]

    if (isLoggedIn && session.user) {
        const userRole = session.user.user_metadata.role; [cite: 222]
        // ถ้าเป็น Admin ระบบจะอนุญาตให้เปิด Dashboard แอดมินได้ในภายหลัง 
        fetchWalletThemeAndAvatar(); [cite: 222]
    }
}
