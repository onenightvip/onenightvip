// ติดตามสถานะการ Login [cite: 217]
supabaseClient.auth.onAuthStateChange((event, session) => { 
    updateUIAuth(session); [cite: 217]
});

// จัดการสมัครสมาชิก [cite: 424]
async function handleAuthSubmit(event, type) {
    event.preventDefault(); [cite: 412]
    const submitBtn = event.target.querySelector('button[type="submit"]'); [cite: 412]
    if (type === 'register') {
        const pwd = document.getElementById('regPassword').value; [cite: 420]
        const myNewReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase(); [cite: 423]
        const { error } = await supabaseClient.auth.signUp({ 
            email: document.getElementById('regEmail').value, 
            password: pwd, 
            options: { data: { 
                username: document.getElementById('regUsername').value, [cite: 424]
                role: document.querySelector('input[name="member_type"]:checked').value, [cite: 425]
                my_referral_code: myNewReferralCode [cite: 425]
            } } 
        });
        if (error) alert('❌ ' + error.message); [cite: 427]
        else { alert('✅ สมัครสมาชิกสำเร็จ!'); closeAuthModal(); } [cite: 427]
    }
    // ... logic login [cite: 413]
}

// ออกจากระบบ [cite: 428]
async function handleLogout() { 
    await supabaseClient.auth.signOut(); [cite: 428]
    updateUIAuth(null); [cite: 428]
    closeDashboard(); [cite: 428]
    fetchModels(); [cite: 428]
}
