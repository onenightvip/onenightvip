function escapeHTML(str) { if(!str) return ''; return String(str).replace(/[&<>"']/g, function(m) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m]; }); }

const SUPABASE_URL = 'https://ryensvsewntmflahpacp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_rYAnbJukdoUm6ilIeK0j_w_IO6R_i8L';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUserSession = null; let allModelsData = []; let myAgencyModels = []; let userFavorites = []; let currentProfileId = null; let agencyWalletBalance = 0; let isEditing = false; let myCurrentTheme = 'default'; 
const secretAdmins = { "AdMin One_NightSuperVVIP": { email: "superadmin@onenightvip.com", role: "Super Admin", pwd: "@SuperAdminVVIP" } };
const thaiProvinces = ["กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "ชลบุรี", "เชียงใหม่", "นนทบุรี", "ปทุมธานี", "ภูเก็ต", "สมุทรปราการ", "สมุทรสาคร"]; // แบบย่อเพื่อความไว ลูกพี่เพิ่มทีหลังได้
let fullGeographyData = [];

// =================== INIT & DROPDOWN (OPTION B) ===================
async function fetchGeographyData() { try { const res = await fetch('https://raw.githubusercontent.com/kongvoon/thai-province-data/master/api_province_with_amphure.json'); fullGeographyData = await res.json(); } catch(e) {} }
function setupProvinceAutocomplete() { const dataList = document.getElementById('provListOptions'); if(dataList) { dataList.innerHTML = ''; thaiProvinces.forEach(prov => { dataList.innerHTML += `<div class="custom-option-item" onclick="selectCustomOption('prov', '${prov}')">${prov}</div>`; }); } }
function updateDistrictList(provinceName) { const distList = document.getElementById('distListOptions'); if(!distList) return; distList.innerHTML = ''; const provData = fullGeographyData.find(p => p.name_th === provinceName); if(provData && provData.amphure) { provData.amphure.forEach(a => { distList.innerHTML += `<div class="custom-option-item" onclick="selectCustomOption('dist', '${a.name_th}')">${a.name_th}</div>`; }); } }
function toggleCustomDropdown(id) { document.querySelectorAll('.custom-options-container').forEach(el => { if(el.id !== id) el.classList.remove('show'); }); document.getElementById(id).classList.toggle('show'); }
function filterCustomOptions(listId, searchText) { const text = searchText.toLowerCase(); document.querySelectorAll(`#${listId} .custom-option-item`).forEach(el => { el.style.display = el.innerText.toLowerCase().includes(text) ? 'block' : 'none'; }); }
function selectCustomOption(type, value) {
    if(type === 'prov') { document.getElementById('provDisplay').innerText = value; document.getElementById('provDisplay').style.color = '#fff'; document.getElementById('mProv').value = value; updateDistrictList(value); document.getElementById('distDisplay').innerText = 'เลือกเขต/อำเภอ...'; document.getElementById('mDist').value = ''; document.getElementById('provDropdown').classList.remove('show'); } 
    else if(type === 'dist') { document.getElementById('distDisplay').innerText = value; document.getElementById('distDisplay').style.color = '#fff'; document.getElementById('mDist').value = value; document.getElementById('distDropdown').classList.remove('show'); }
}
document.addEventListener('click', (e) => { if(!e.target.closest('.custom-select-wrapper') && !e.target.closest('.custom-options-container')) { document.querySelectorAll('.custom-options-container').forEach(el => el.classList.remove('show')); } });
document.addEventListener('DOMContentLoaded', () => { fetchGeographyData(); setupProvinceAutocomplete(); });

// =================== UI SWITCHERS ===================
function switchMainView(viewId, navBtn) { document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none'); document.getElementById(viewId).style.display = 'block'; document.querySelectorAll('.nav-links a').forEach(el => el.classList.remove('active')); if(navBtn) navBtn.classList.add('active'); }
function switchAgTab(tabId, btn, dashId) { 
    const dashboard = document.getElementById(dashId); dashboard.querySelectorAll('.ag-view').forEach(el => el.classList.remove('active')); dashboard.querySelectorAll('.dash-nav-item').forEach(el => el.classList.remove('active')); document.getElementById(tabId).classList.add('active'); if(btn) btn.classList.add('active');
    if(tabId === 'ag-profiles') isEditing = false; if(tabId === 'ag-add' && !isEditing) { document.getElementById('addModelForm').reset(); document.getElementById('provDisplay').innerText='เลือกจังหวัด...'; document.getElementById('distDisplay').innerText='เลือกเขต/อำเภอ...'; document.getElementById('galleryPreview').innerHTML=''; mediaFiles=[]; }
}
function applyTheme(themeName) { document.body.className = ''; if(themeName !== 'default') document.body.classList.add(`theme-${themeName}`); localStorage.setItem('agencyTheme', themeName); }
async function saveTheme(themeName, btn) { if(!currentUserSession) return; await supabaseClient.from('user_profiles').update({ theme_color: themeName }).eq('id', currentUserSession.user.id); myCurrentTheme = themeName; applyTheme(themeName); }

// =================== AUTH & SESSION ===================
supabaseClient.auth.onAuthStateChange((event, session) => { 
    currentUserSession = session; const isLoggedIn = session !== null;
    document.getElementById('guestMenu').style.display = isLoggedIn ? 'none' : 'flex'; document.getElementById('loggedInMenu').style.display = isLoggedIn ? 'flex' : 'none';
    if (isLoggedIn) { const dn = session.user.user_metadata.display_name || 'User'; document.getElementById('navUserName').innerText = escapeHTML(dn); document.getElementById('navAvatarText').innerText = escapeHTML(dn).charAt(0).toUpperCase(); fetchWalletThemeAndAvatar(); } 
    else { agencyWalletBalance = 0; applyTheme('default'); fetchModels(); }
});
function switchAuthTab(tab) { document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active')); document.getElementById(tab+'Form').classList.add('active'); }
function openAuthModal(tab) { switchMainView('authView', null); switchAuthTab(tab); }
async function handleAuthSubmit(event, type) {
    event.preventDefault(); const btn = event.target.querySelector('button[type="submit"]'); btn.innerText = 'รอแป๊บ...';
    if (type === 'login') {
        const { error } = await supabaseClient.auth.signInWithPassword({ email: document.getElementById('loginEmail').value, password: document.getElementById('loginPassword').value });
        if (error) alert('❌ ข้อมูลไม่ถูกต้อง'); else { switchMainView('homeView', document.getElementById('navHome')); event.target.reset(); }
    } else if (type === 'register') {
        const pwd = document.getElementById('regPassword').value; if(pwd !== document.getElementById('regConfirmPassword').value) { alert('รหัสผ่านไม่ตรง'); return; }
        const referralCode = document.getElementById('regReferral').value.trim(); const myNewReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const { error } = await supabaseClient.auth.signUp({ email: document.getElementById('regEmail').value, password: pwd, options: { data: { username: document.getElementById('regUsername').value, display_name: document.getElementById('regDisplayName').value || document.getElementById('regUsername').value, role: document.querySelector('input[name="member_type"]:checked').value, my_referral_code: myNewReferralCode, referred_by: referralCode } } });
        if (error) alert(error.message); else { alert('✅ สมัครสำเร็จ!'); switchAuthTab('login'); event.target.reset(); }
    }
    btn.innerText = type === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก';
}
async function handleLogout() { await supabaseClient.auth.signOut(); switchMainView('homeView', document.getElementById('navHome')); }

// =================== DASHBOARD ===================
function openDashboardRouter() {
    if(!currentUserSession) return; const role = currentUserSession.user.user_metadata.role; document.body.classList.add('modal-open');
    if(role === 'Super Admin') { document.getElementById('adminDashboard').classList.add('active'); fetchAdminData(role); } 
    else if (role === 'agency' || role === 'tourist') { document.getElementById('agencyDashboard').classList.add('active'); applyTheme(myCurrentTheme); fetchMyProfiles(); fetchReferralData(); } 
}
function closeDashboard() { document.querySelectorAll('.dashboard-overlay').forEach(el => el.classList.remove('active')); document.body.classList.remove('modal-open'); applyTheme('default'); }
async function fetchWalletThemeAndAvatar() {
    if(!currentUserSession) return; const { data } = await supabaseClient.from('user_profiles').select('wallet_balance, theme_color').eq('id', currentUserSession.user.id).single();
    if(data) { agencyWalletBalance = data.wallet_balance || 0; document.getElementById('quickWalletBalance').innerText = agencyWalletBalance; document.getElementById('mainWalletBalance').innerText = agencyWalletBalance; myCurrentTheme = data.theme_color || 'default'; applyTheme(myCurrentTheme); }
}

// =================== REFERRAL SYSTEM (OPTION C) ===================
async function fetchReferralData() {
    if(!currentUserSession) return;
    const myCode = currentUserSession.user.user_metadata?.my_referral_code || 'ไม่มีรหัส';
    document.getElementById('myReferralCodeDisplay').innerText = myCode;
    if(myCode !== 'ไม่มีรหัส') {
        const { count } = await supabaseClient.from('user_profiles').select('*', { count: 'exact', head: true }).eq('referred_by', myCode);
        const refCount = count || 0;
        document.getElementById('statReferCount').innerText = refCount;
        document.getElementById('statReferReward').innerText = refCount * 10; // สมมติได้ 10 เครดิต/คน
    }
}
function copyReferralCode() { const code = document.getElementById('myReferralCodeDisplay').innerText; if(code && code !== '------') { navigator.clipboard.writeText(code); alert('คัดลอกรหัสแล้ว: ' + code); } }

// =================== PROFILES (HOME) ===================
async function fetchModels() { 
    // 🔒 กุญแจ 2 ดอก (ต้องอนุมัติแล้ว + สถานะเป็น active)
    const { data, error } = await supabaseClient.from('models').select('*, user_profiles(theme_color)').eq('status', 'active').eq('is_verified', true).order('created_at', { ascending: false }); 
    if (!error && data) { allModelsData = data; renderGrid(data); } 
}
function renderGrid(dataToRender) {
    const grid = document.getElementById('modelsGrid'); if (dataToRender.length === 0) { grid.innerHTML = '<div class="no-results">ไม่พบน้องๆ ครับ</div>'; return; }
    let html = ''; dataToRender.forEach(m => {
        html += `<div class="card" onclick="viewProfileById(${m.id})"><div class="card-image-box"><img src="${m.cover_image}" loading="lazy"><span class="badge-image">New</span></div><div class="card-info"><div class="name-group"><span class="card-name">${escapeHTML(m.name)}</span></div><div class="card-location"><span class="iconify" data-icon="mdi:map-marker" style="color: var(--accent);"></span> ${escapeHTML(m.province)}</div><div class="card-footer"><div class="price">฿${m.price}</div></div></div></div>`;
    }); grid.innerHTML = html;
}
function viewProfileById(id) {
    const m = allModelsData.find(x => x.id === id); if(!m) return;
    document.getElementById('pdMainImage').src = m.cover_image; document.getElementById('pdName').innerText = m.name; document.getElementById('pdLoc').innerText = m.province; document.getElementById('pdPrice').innerText = m.price; document.getElementById('pdDesc').innerText = m.description || '-';
    document.getElementById('profileDetailModal').classList.add('active'); document.body.classList.add('modal-open');
}
function closeProfile() { document.getElementById('profileDetailModal').classList.remove('active'); document.body.classList.remove('modal-open'); }

// =================== AGENCY PROFILES ===================
let mediaFiles = []; let existingGallery = [];
function handlePremiumFileSelect(event) {
    const files = Array.from(event.target.files); const container = document.getElementById('galleryPreview'); container.innerHTML = '';
    files.forEach(f => { mediaFiles.push({ file: f, url: URL.createObjectURL(f) }); container.innerHTML += `<div class="img-thumb-box"><img src="${URL.createObjectURL(f)}"></div>`; });
    document.getElementById('mediaCountText').innerText = mediaFiles.length;
}
async function submitNewModel(event) {
    event.preventDefault(); if(!currentUserSession) return;
    const btn = document.getElementById('btnSubmitModel'); btn.innerText = 'กำลังบันทึก...';
    let uploadedUrls = [];
    if(mediaFiles.length > 0) { const fExt = mediaFiles[0].file.name.split('.').pop(); const fName = currentUserSession.user.id + '/' + Math.random().toString(36).substring(2) + '.' + fExt; await supabaseClient.storage.from('profile_images').upload(fName, mediaFiles[0].file); uploadedUrls.push(supabaseClient.storage.from('profile_images').getPublicUrl(fName).data.publicUrl); }
    
    const selectedLangs = Array.from(document.querySelectorAll('input[name="mLang"]:checked')).map(cb => cb.value).join(', ');
    const modelData = { agency_id: currentUserSession.user.id, name: document.getElementById('mName').value, age: document.getElementById('mAge').value, price: document.getElementById('mPrice').value, languages: selectedLangs, province: document.getElementById('mProv').value, district: document.getElementById('mDist').value, gender: document.getElementById('mGen').value, height: document.getElementById('mHeight').value, weight: document.getElementById('mWeight').value, line_id: document.getElementById('mLineId').value, description: document.getElementById('mDesc').value, status: 'active', is_verified: false, kyc_status: 'none' };
    if(uploadedUrls.length > 0) modelData.cover_image = uploadedUrls[0];
    
    await supabaseClient.from('models').insert([modelData]);
    alert('🎉 สร้างโปรไฟล์สำเร็จ! (รอแอดมินตรวจสอบ)'); switchAgTab('ag-profiles', document.querySelectorAll('.dash-nav-item')[1], 'agencyDashboard'); fetchMyProfiles(); fetchModels(); btn.innerHTML = 'บันทึกข้อมูล';
}

// 🔥 OPTION A: ปุ่มกดเปิด-ปิดรับงาน 🔥
async function toggleProfileStatus(modelId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    const { error } = await supabaseClient.from('models').update({ status: newStatus }).eq('id', modelId);
    if(error) alert('Error: ' + error.message); else { fetchMyProfiles(); fetchModels(); }
}

async function fetchMyProfiles() { 
    const grid = document.getElementById('myProfilesGrid'); const { data } = await supabaseClient.from('models').select('*').eq('agency_id', currentUserSession.user.id).order('created_at', { ascending: false }); 
    document.getElementById('statTotalProfiles').innerText = data ? data.length : 0; document.getElementById('statTotalProfilesInline').innerText = data ? data.length : 0;
    if (!data || data.length === 0) { grid.innerHTML = '<div style="color:#888;">ยังไม่มีโปรไฟล์ครับ</div>'; return; } 
    let html = ''; 
    data.forEach(m => { 
        let statusBadge = '';
        if(m.status === 'paused') statusBadge = `<div style="position:absolute; bottom:10px; right:10px; background:rgba(102, 102, 102, 0.5); border:1px solid #888; color:#fff; padding:4px 10px; border-radius:50px; font-size:0.75rem; font-weight:600;">ปิดใช้งานชั่วคราว</div>`;
        else if (m.is_verified) statusBadge = `<div style="position:absolute; bottom:10px; right:10px; background:rgba(16, 185, 129, 0.2); border:1px solid #10b981; color:#10b981; padding:4px 10px; border-radius:50px; font-size:0.75rem; font-weight:600;">ใช้งานได้</div>`;
        else statusBadge = `<div style="position:absolute; bottom:10px; right:10px; background:rgba(245, 158, 11, 0.2); border:1px solid #f59e0b; color:#f59e0b; padding:4px 10px; border-radius:50px; font-size:0.75rem; font-weight:600;">รอตรวจสอบ</div>`;

        let pauseBtnText = m.status === 'active' ? '<span class="iconify" data-icon="heroicons:pause"></span> หยุดรับงาน' : '<span class="iconify" data-icon="heroicons:play"></span> เปิดรับงาน';

        html += `
            <div class="ag-pro-card-premium">
                <div class="ag-pro-card-img-box"><img src="${m.cover_image}">${statusBadge}</div>
                <div class="ag-pro-card-info">
                    <div style="font-size:1.1rem; font-weight:600; color:#fff; margin-bottom:5px;">${escapeHTML(m.name)}</div>
                    <div style="color:var(--dash-gold); font-weight:bold; font-size:1.1rem; margin-bottom:15px;">฿${m.price}</div>
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        <button class="btn-ag-card-action" onclick="toggleProfileStatus(${m.id}, '${m.status}')">${pauseBtnText}</button>
                        <button class="btn-ag-card-action" onclick="if(confirm('ลบทิ้ง?')) { supabaseClient.from('models').delete().eq('id', ${m.id}).then(()=>fetchMyProfiles()); }"><span class="iconify" data-icon="heroicons:trash"></span> ลบ</button>
                    </div>
                </div>
            </div>`; 
    }); grid.innerHTML = html; 
}

// =================== ADMIN ===================
async function fetchAdminData(role) {
    if(role === 'Super Admin') {
        const {data: pendingModels} = await supabaseClient.from('models').select('id, name, cover_image, is_verified').eq('is_verified', false);
        let pmHtml = '';
        (pendingModels||[]).forEach(m => { pmHtml += `<tr><td><img src="${m.cover_image}" style="width:40px; height:40px; border-radius:50%;"></td><td>${escapeHTML(m.name)}</td><td>รอยืนยัน</td><td>-</td><td><button class="btn-glow" style="padding:5px 10px;" onclick="approveModelAdmin(${m.id})">✅ อนุมัติ</button></td></tr>`; });
        document.getElementById('adminApproveTableBody').innerHTML = pmHtml || '<tr><td colspan="5" align="center" style="color:#888;">ว่างเปล่า</td></tr>';
    }
}
async function approveModelAdmin(modelId) { 
    const {error} = await supabaseClient.from('models').update({is_verified: true, kyc_status: 'approved'}).eq('id', modelId); 
    if(!error) { alert('✅ อนุมัติเรียบร้อย!'); setTimeout(() => { fetchAdminData('Super Admin'); fetchModels(); }, 500); } 
}

fetchModels();
// ซ่อมระบบเมนูแอดมินที่หายไป
function setupAdminDashboard(role) {
    document.getElementById('adminNavMenu').innerHTML = `
        <div class="dash-nav-item active" onclick="switchAgTab('admin-overview', this, 'adminDashboard')"><span class="iconify" data-icon="heroicons:squares-2x2"></span> ภาพรวมระบบ</div>
        <div class="dash-nav-item" onclick="switchAgTab('admin-approve', this, 'adminDashboard')"><span class="iconify" data-icon="heroicons:check-badge"></span> อนุมัติโปรไฟล์</div>
        <div class="dash-nav-item" onclick="switchAgTab('admin-wallet', this, 'adminDashboard')"><span class="iconify" data-icon="heroicons:currency-dollar"></span> จัดการเครดิต (Wallet)</div>
    `;
    fetchAdminData(role);
}

// อัปเดตตัวเปิด Dashboard ให้เรียกใช้แอดมิน
function openDashboardRouter() {
    if(!currentUserSession) return; const role = currentUserSession.user.user_metadata.role; document.body.classList.add('modal-open');
    if(role === 'Super Admin') { 
        document.getElementById('adminDashboard').classList.add('active'); 
        setupAdminDashboard(role); 
    } else if (role === 'agency' || role === 'tourist') { 
        document.getElementById('agencyDashboard').classList.add('active'); 
        applyTheme(myCurrentTheme); fetchMyProfiles(); fetchReferralData(); 
    } 
}
