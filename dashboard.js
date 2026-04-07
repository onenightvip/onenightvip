// --- ระบบจัดการหน้า Dashboard ---

// 1. ฟังก์ชันเปิด Dashboard ตามสิทธิ์ (Role)
function openDashboardRouter() {
    if (!currentUserSession) return;
    
    // เช็คสิทธิ์จาก Role ใน Metadata (ไม่มีรหัสผ่านฝังแล้ว)
    const role = currentUserSession.user.user_metadata.role; 
    document.body.classList.add('modal-open');
    
    if (role === 'Super Admin' || role === 'Admin') { 
        document.getElementById('adminDashboard').classList.add('active'); 
        setupAdminDashboard(role); // ไปเซตเมนูแอดมิน
    } else { 
        document.getElementById('agencyDashboard').classList.add('active'); 
        applyTheme(myCurrentTheme); 
        fetchMyProfiles();    // ดึงโปรไฟล์น้องๆ ของเรา
        fetchReferralData();  // ดึงสถิติแนะนำเพื่อนจริง
    } 
}

// 2. ดึงสถิติการแนะนำเพื่อนจาก Database
async function fetchReferralData() {
    if (!currentUserSession) return;
    
    // ดึงรหัสตัวเองมาโชว์
    const myCode = currentUserSession.user.user_metadata.my_referral_code;
    const codeDisplay = document.getElementById('myReferralCodeDisplay');
    if(codeDisplay) codeDisplay.innerText = myCode || '------';

    if (myCode) {
        // นับจำนวนเพื่อนที่ใช้รหัสเราสมัครจริงในตาราง user_profiles
        const { count, error } = await supabaseClient
            .from('user_profiles')
            .select('*', { count: 'exact', head: true })
            .eq('referred_by', myCode);

        if (!error) {
            const refCount = count || 0;
            // โชว์จำนวนคน
            const countEl = document.getElementById('statReferCount');
            if(countEl) countEl.innerText = refCount;
            
            // คำนวณเครดิตที่ควรได้รับ (เช่น คนละ 50 บาท)
            const rewardEl = document.getElementById('statReferReward');
            if(rewardEl) rewardEl.innerText = (refCount * 50).toLocaleString();
        }
    }
}

// 3. ปิดหน้า Dashboard
function closeDashboard() {
    document.querySelectorAll('.dashboard-overlay').forEach(el => el.classList.remove('active'));
    document.body.classList.remove('modal-open');
    applyTheme('default');
}
