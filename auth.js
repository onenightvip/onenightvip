// ติดตามสถานะการ Login อัตโนมัติ
supabaseClient.auth.onAuthStateChange((event, session) => { 
    updateUIAuth(session); [cite: 217]
    if (event === 'PASSWORD_RECOVERY') { 
        openAuthModal('updatePwd'); [cite: 217]
    } 
});

// ฟังก์ชัน Login (ถอดรหัสผ่าน Admin ออกแล้ว)
async function handleAuthSubmit(event, type) {
    event.preventDefault();
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = 'ประมวลผล...'; [cite: 412]

    if (type === 'login') {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value; [cite: 413]

        // ยิงตรงเข้า Supabase เพื่อเช็คเมลและรหัสผ่าน
        const { data, error } = await supabaseClient.auth.signInWithPassword({ 
            email: email, 
            password: password 
        }); [cite: 416]

        if (error) {
            alert('❌ อีเมลหรือรหัสผ่านไม่ถูกต้อง'); [cite: 419]
        } else {
            alert('✅ เข้าสู่ระบบสำเร็จ');
            closeAuthModal(); [cite: 419]
            event.target.reset(); [cite: 419]
        }
    } 
    // ระบบ Register
    else if (type === 'register') {
        const pwd = document.getElementById('regPassword').value;
        if(pwd !== document.getElementById('regConfirmPassword').value) { 
            alert('❌ รหัสผ่านไม่ตรงกัน'); 
            submitBtn.innerText = originalText; 
            return; [cite: 421]
        }
        
        const referralCode = document.getElementById('regReferral').value.trim(); [cite: 422]
        const myNewReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase(); [cite: 423]

        const { error } = await supabaseClient.auth.signUp({ 
            email: document.getElementById('regEmail').value, 
            password: pwd, 
            options: { 
                data: { 
                    username: document.getElementById('regUsername').value, 
                    display_name: document.getElementById('regDisplayName').value || document.getElementById('regUsername').value, 
                    role: document.querySelector('input[name="member_type"]:checked').value,
                    my_referral_code: myNewReferralCode,
                    referred_by: referralCode 
                } 
            } 
        }); [cite: 424, 425]
        
        if (error) alert('❌ ' + error.message); 
        else { 
            alert('✅ สมัครสมาชิกสำเร็จ!'); 
            closeAuthModal(); 
            event.target.reset(); 
        } [cite: 427]
    }
    submitBtn.innerText = originalText; [cite: 428]
}

// อัปเดต UI เมื่อมีการเข้าสู่ระบบ/ออกจากระบบ
function updateUIAuth(session) {
    currentUserSession = session; 
    const isLoggedIn = session !== null; [cite: 218]
    
    document.getElementById('guestMenu').style.display = isLoggedIn ? 'none' : 'flex'; 
    document.getElementById('loggedInMenu').style.display = isLoggedIn ? 'flex' : 'none'; [cite: 219]
    
    if (isLoggedIn && session.user) {
        fetchUserFavorites(); 
        fetchWalletThemeAndAvatar(); [cite: 222]
        
        const displayName = session.user.user_metadata.display_name || session.user.email.split('@')[0]; [cite: 223]
        document.getElementById('navUserName').innerText = escapeHTML(displayName); 
        document.getElementById('navAvatarText').innerText = escapeHTML(displayName).charAt(0).toUpperCase(); [cite: 223]
    } else {
        userFavorites = []; 
        agencyWalletBalance = 0; 
        applyTheme('default'); 
        handleSearch(); 
    } [cite: 226]
}

// ฟังก์ชันออกจากระบบ
async function handleLogout() { 
    await supabaseClient.auth.signOut(); 
    updateUIAuth(null); 
    closeDashboard(); 
    fetchModels(); 
    switchMainView('homeView', document.getElementById('navHome')); 
} [cite: 428]
