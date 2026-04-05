function escapeHTML(str) { if(!str) return ''; return String(str).replace(/[&<>"']/g, function(m) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m]; }); }

const SUPABASE_URL = 'https://ryensvsewntmflahpacp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_rYAnbJukdoUm6ilIeK0j_w_IO6R_i8L';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUserSession = null; let allModelsData = []; let myAgencyModels = []; let userFavorites = []; let currentProfileId = null; let selectedRating = 5; let agencyWalletBalance = 0; let isEditing = false; let dashboardChartInstance = null; let myCurrentTheme = 'default'; 

const secretAdmins = { "AdMin One_NightSuperVVIP": { email: "superadmin@onenightvip.com", role: "Super Admin", pwd: "@SuperAdminVVIP" }, "AdMin One_NightVVIP": { email: "developer@onenightvip.com", role: "Developer", pwd: "@AdminVVIP01" }, "AdMin One_NightVIP": { email: "admin02@onenightvip.com", role: "Admin", pwd: "@AdminVIP02" } };

const thaiProvinces = ["กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร", "ขอนแก่น", "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท", "ชัยภูมิ", "ชุมพร", "เชียงราย", "เชียงใหม่", "ตรัง", "ตราด", "ตาก", "นครนายก", "นครปฐม", "นครพนม", "นครราชสีมา", "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี", "นราธิวาส", "น่าน", "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์", "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา", "พะเยา", "พังงา", "พัทลุง", "พิจิตร", "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์", "แพร่", "ภูเก็ต", "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน", "ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง", "ระยอง", "ราชบุรี", "ลพบุรี", "ลำปาง", "ลำพูน", "เลย", "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ", "สมุทรสงคราม", "สมุทรสาคร", "สระแก้ว", "สระบุรี", "สิงห์บุรี", "สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย", "หนองบัวลำภู", "อ่างทอง", "อำนาจเจริญ", "อุดรธานี", "อุตรดิตถ์", "อุทัยธานี", "อุบลราชธานี"];
let fullGeographyData = [];

async function fetchGeographyData() { try { const res = await fetch('https://raw.githubusercontent.com/kongvoon/thai-province-data/master/api_province_with_amphure.json'); fullGeographyData = await res.json(); } catch(e) { console.error("โหลดข้อมูลอำเภอไม่สำเร็จ", e); } }
function setupProvinceAutocomplete() { const dataList = document.getElementById('provList'); if(dataList) { thaiProvinces.forEach(prov => { let option = document.createElement('option'); option.value = prov; dataList.appendChild(option); }); } }
function updateDistrictList(provinceName) { const distList = document.getElementById('distList'); const distInput = document.getElementById('mDist'); if(!distList || !distInput) return; distList.innerHTML = ''; distInput.value = ''; const provData = fullGeographyData.find(p => p.name_th === provinceName); if(provData && provData.amphure) { provData.amphure.forEach(a => { let option = document.createElement('option'); option.value = a.name_th; distList.appendChild(option); }); } }

document.addEventListener('DOMContentLoaded', () => {
    fetchGeographyData(); setupProvinceAutocomplete();
    const provInput = document.getElementById('mProv');
    if(provInput) { provInput.addEventListener('change', function(e) { let val = e.target.value.trim(); if(val === 'กทม' || val === 'กทม.') val = 'กรุงเทพมหานคร'; else if(val === 'กรุงเทพ') val = 'กรุงเทพมหานคร'; else if(val === 'โคราช') val = 'นครราชสีมา'; else if(val === 'เมืองชล') val = 'ชลบุรี'; e.target.value = val; updateDistrictList(val); }); }
});

function switchMainView(viewId, navBtn) { document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none'); document.getElementById(viewId).style.display = 'block'; document.querySelectorAll('.nav-links a, .sheet-links a').forEach(el => el.classList.remove('active')); if(navBtn) navBtn.classList.add('active'); if(viewId === 'agencyListView') fetchAgenciesPublic(); if(viewId === 'leaderboardView') fetchLeaderboard(); }
function renderDashboardChart() { const ctx = document.getElementById('trendChart'); if(!ctx) return; if(dashboardChartInstance) dashboardChartInstance.destroy(); const labels = ['มี.ค. 29', 'มี.ค. 30', 'มี.ค. 31', 'เม.ย. 1', 'เม.ย. 2', 'เม.ย. 3', 'เม.ย. 4']; const dataViews = [0, 0, 0, 0, 380, 250, 40]; const dataClicks = [0, 0, 0, 0, 90, 40, 0]; dashboardChartInstance = new Chart(ctx.getContext('2d'), { type: 'line', data: { labels: labels, datasets: [ { label: ' ยอดเข้าชมโปรไฟล์', data: dataViews, borderColor: '#e29f8c', backgroundColor: 'rgba(226, 159, 140, 0.1)', borderWidth: 2, fill: true, tension: 0.4, pointRadius: 0 }, { label: ' คลิกติดต่อ', data: dataClicks, borderColor: '#b56c5e', backgroundColor: 'transparent', borderWidth: 2, fill: false, tension: 0.4, pointRadius: 0 } ] }, options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false } } }); }
function switchLang(lang, btn) { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); }
function toggleMobileMenu(forceClose = false) { const overlay = document.getElementById('mobileOverlay'); const sheet = document.getElementById('mobileSheet'); if(forceClose) { overlay.classList.remove('active'); sheet.classList.remove('active'); } else { overlay.classList.toggle('active'); sheet.classList.toggle('active'); } }
function countChars(obj) { document.getElementById('charNum').innerText = obj.value.length; }
function calcCup() { let chest = parseInt(document.getElementById('mChest').value); let cup = document.getElementById('mCup'); if(!chest) return; if(chest <= 32) cup.value = 'A'; else if(chest <= 34) cup.value = 'B'; else if(chest <= 36) cup.value = 'C'; else if(chest <= 38) cup.value = 'D'; else if(chest <= 40) cup.value = 'E'; else cup.value = 'F'; }
const isVideoFile = (url) => url.match(/\.(mp4|webm|mov|quicktime|ogg)$/i);

supabaseClient.auth.onAuthStateChange((event, session) => { updateUIAuth(session); if (event === 'PASSWORD_RECOVERY') { openAuthModal('updatePwd'); } });

function updateUIAuth(session) {
    currentUserSession = session; const isLoggedIn = session !== null;
    document.getElementById('guestMenu').style.display = isLoggedIn ? 'none' : 'flex'; document.getElementById('loggedInMenu').style.display = isLoggedIn ? 'flex' : 'none';
    document.getElementById('mobileGuestMenu').style.display = isLoggedIn ? 'none' : 'grid'; document.getElementById('mobileLoggedInMenu').style.display = isLoggedIn ? 'grid' : 'none';
    document.getElementById('btnFilterFav').style.display = isLoggedIn ? 'inline-block' : 'none'; document.getElementById('pleaseLoginReview').style.display = isLoggedIn ? 'none' : 'block'; document.getElementById('reviewForm').style.display = isLoggedIn ? 'block' : 'none';
    if (isLoggedIn && session.user) {
        fetchUserFavorites(); fetchWalletThemeAndAvatar(); 
        const userRole = session.user.user_metadata.role; const displayName = session.user.user_metadata.display_name || session.user.email.split('@')[0];
        document.getElementById('navUserName').innerText = escapeHTML(displayName); document.getElementById('navAvatarText').innerText = escapeHTML(displayName).charAt(0).toUpperCase();
        let roleDisplay = 'นักท่องเที่ยว'; if(userRole === 'agency') roleDisplay = 'เอเจนซี่'; else if(userRole === 'freelance') roleDisplay = 'รับงานอิสระ'; else if(userRole === 'Super Admin' || userRole === 'Developer' || userRole === 'Admin') roleDisplay = userRole;
        document.getElementById('navUserRole').innerText = roleDisplay;
    } else { userFavorites = []; agencyWalletBalance = 0; applyTheme('default'); handleSearch(); }
}

async function fetchWalletThemeAndAvatar() {
    if(!currentUserSession) return;
    const { data, error } = await supabaseClient.from('user_profiles').select('wallet_balance, theme_color, avatar_url').eq('id', currentUserSession.user.id).single();
    if(!error && data) { 
        agencyWalletBalance = data.wallet_balance || 0; 
        document.getElementById('quickWalletBalance').innerText = agencyWalletBalance.toLocaleString(); 
        document.getElementById('mainWalletBalance').innerText = agencyWalletBalance.toLocaleString(); 
        
        myCurrentTheme = data.theme_color || 'default';
        localStorage.setItem('agencyTheme', myCurrentTheme);
        applyTheme(myCurrentTheme); 
        
        if(data.avatar_url) {
            document.getElementById('navAvatarImg').src = data.avatar_url; document.getElementById('navAvatarImg').style.display = 'block'; document.getElementById('navAvatarText').style.display = 'none';
            document.getElementById('agLogoImg').src = data.avatar_url; document.getElementById('agLogoImg').style.display = 'block'; document.getElementById('agLogoText').style.display = 'none';
        }
    }
}

async function uploadAgencyLogo(event) {
    const file = event.target.files[0]; if(!file) return; if(file.size > 5 * 1024 * 1024) { alert('รูปต้องไม่เกิน 5MB ครับ'); return; }
    const btn = event.target.nextElementSibling; const oldText = btn.innerHTML; btn.innerHTML = 'กำลังอัปโหลด...';
    const fExt = file.name.split('.').pop(); const fName = 'logos/' + currentUserSession.user.id + '_' + Date.now() + '.' + fExt; 
    const { error: uploadErr } = await supabaseClient.storage.from('profile_images').upload(fName, file); 
    if (uploadErr) { alert('Upload failed: ' + uploadErr.message); btn.innerHTML = oldText; return; } 
    const logoUrl = supabaseClient.storage.from('profile_images').getPublicUrl(fName).data.publicUrl; 
    const { error: updateErr } = await supabaseClient.from('user_profiles').update({ avatar_url: logoUrl }).eq('id', currentUserSession.user.id);
    if(updateErr) alert('Save failed: ' + updateErr.message);
    else {
        document.getElementById('agLogoImg').src = logoUrl; document.getElementById('agLogoImg').style.display = 'block'; document.getElementById('agLogoText').style.display = 'none';
        document.getElementById('navAvatarImg').src = logoUrl; document.getElementById('navAvatarImg').style.display = 'block'; document.getElementById('navAvatarText').style.display = 'none';
        alert('อัปโหลดโลโก้สำเร็จ!');
    }
    btn.innerHTML = oldText;
}

function applyTheme(themeName) { document.body.className = document.body.className.replace(/theme-\w+/g, '').trim(); if(themeName && themeName !== 'default') { document.body.classList.add(`theme-${themeName}`); } localStorage.setItem('agencyTheme', themeName || 'default'); }
async function saveTheme(themeName, btnElement) { if(!currentUserSession) return; const oldBorder = btnElement.style.borderColor; btnElement.style.borderColor = '#10b981'; const { error } = await supabaseClient.from('user_profiles').update({ theme_color: themeName }).eq('id', currentUserSession.user.id); if(!error) { myCurrentTheme = themeName; applyTheme(themeName); setTimeout(() => { btnElement.style.borderColor = oldBorder; }, 1000); } else { alert('Error: ' + error.message); } }

function openDashboardRouter() {
    if(!currentUserSession) return; const role = currentUserSession.user.user_metadata.role; closeDashboard();
    if(role === 'Super Admin' || role === 'Developer' || role === 'Admin') { setupAdminDashboard(role); document.getElementById('adminDashboard').classList.add('active'); } 
    else if (role === 'agency' || role === 'freelance' || role === 'Owner') { document.getElementById('agencyDashboard').classList.add('active'); applyTheme(myCurrentTheme); fetchMyProfiles(); fetchWalletThemeAndAvatar(); setTimeout(() => { renderDashboardChart(); }, 100); } 
    else { document.getElementById('touristDashboard').classList.add('active'); loadTouristFavorites(); }
    document.body.classList.add('modal-open');
}
function closeDashboard() { document.querySelectorAll('.dashboard-overlay').forEach(el => el.classList.remove('active')); document.body.classList.remove('modal-open'); applyTheme('default'); }

function loadTouristFavorites() { const grid = document.getElementById('touristFavGrid'); const favModels = allModelsData.filter(m => userFavorites.includes(m.id)); if(favModels.length === 0) { grid.innerHTML = '<div class="no-results" style="grid-column:1/-1;">คุณยังไม่ได้กดหัวใจให้น้องคนไหนเลยครับ ❤️</div>'; return; } let html = ''; const now = new Date(); favModels.forEach(model => { const ratingAvg = model.rating_avg > 0 ? parseFloat(model.rating_avg).toFixed(1) : 'New'; const badgeHtml = (model.boost_expires_at && new Date(model.boost_expires_at) > now) ? '<span class="badge-hot"><span class="iconify" data-icon="heroicons:fire-solid"></span> HOT</span>' : '<span class="badge-image">New</span>'; const verifiedBadgeHtml = model.is_verified ? '<span class="iconify verified-badge-small" data-icon="heroicons:check-badge-solid"></span>' : ''; html += `<div class="card" onclick="viewProfileById(${model.id})"><div class="card-image-box"><img src="${model.cover_image}" loading="lazy">${badgeHtml}<button class="heart-btn-card" style="border-color: #ff4d4f;" onclick="toggleHeartReal(${model.id}, this, event)"><span class="iconify heart-icon" data-icon="mdi:cards-heart" style="color: #ff4d4f; font-size: 1.5rem;"></span></button></div><div class="card-info"><div class="name-group">${verifiedBadgeHtml}<span class="card-name">${escapeHTML(model.name)}</span></div><div class="card-location"><span class="iconify" data-icon="mdi:map-marker" style="color: var(--accent);"></span> ${escapeHTML(model.location)}</div><div class="card-footer"><div class="price">฿${model.price}</div><div class="engagement"><span class="iconify" data-icon="heroicons:star-solid" style="color: #fbbf24;"></span> ${ratingAvg}</div></div></div></div>`; }); grid.innerHTML = html; }

function setupAdminDashboard(role) { 
    document.getElementById('adminTierName').innerText = role; const navMenu = document.getElementById('adminNavMenu'); navMenu.innerHTML = `<div class="dash-nav-item active" onclick="switchAgTab('admin-overview', this, 'adminDashboard')"><span class="iconify" data-icon="heroicons:squares-2x2"></span> ภาพรวมระบบ</div>`; 
    if(role === 'Super Admin') { navMenu.innerHTML += `<div class="dash-nav-item" onclick="switchAgTab('admin-approve', this, 'adminDashboard')"><span class="iconify" data-icon="heroicons:check-badge"></span> อนุมัติโปรไฟล์</div>`; navMenu.innerHTML += `<div class="dash-nav-item" onclick="switchAgTab('admin-wallet', this, 'adminDashboard')"><span class="iconify" data-icon="heroicons:currency-dollar"></span> จัดการเครดิต (Wallet)</div>`; navMenu.innerHTML += `<div class="dash-nav-item" onclick="switchAgTab('admin-system', this, 'adminDashboard')"><span class="iconify" data-icon="heroicons:code-bracket"></span> ตั้งค่าระบบ</div>`; navMenu.innerHTML += `<div class="dash-nav-item" onclick="switchAgTab('admin-audit', this, 'adminDashboard')"><span class="iconify" data-icon="heroicons:clipboard-document-list"></span> Audit Logs</div>`; } 
    else if (role === 'Developer') { navMenu.innerHTML += `<div class="dash-nav-item" onclick="switchAgTab('admin-system', this, 'adminDashboard')"><span class="iconify" data-icon="heroicons:code-bracket"></span> ตั้งค่าระบบ</div>`; } 
    else if (role === 'Admin') { navMenu.innerHTML += `<div class="dash-nav-item" onclick="switchAgTab('admin-approve', this, 'adminDashboard')"><span class="iconify" data-icon="heroicons:check-badge"></span> อนุมัติโปรไฟล์</div>`; } 
    supabaseClient.from('user_profiles').select('id', { count: 'exact' }).then(({count}) => document.getElementById('adminTotalUsers').innerText = count || 0); supabaseClient.from('models').select('id', { count: 'exact' }).then(({count}) => document.getElementById('adminTotalModels').innerText = count || 0); 
    fetchAdminData(role); 
}

function clearFormOnly() { isEditing = false; document.getElementById('addModelForm').reset(); document.getElementById('editingModelId').value = ""; document.getElementById('addFormTitle').innerText = "สร้างโปรไฟล์ใหม่"; document.getElementById('btnSubmitModel').innerHTML = '<span class="iconify" data-icon="heroicons:check"></span> สร้างโปรไฟล์'; mediaFiles = []; existingGallery = []; renderPremiumGallery(); document.getElementById('mDist').value = ''; document.getElementById('mDist').disabled = false; }
function resetForm() { clearFormOnly(); switchAgTab('ag-profiles', document.querySelectorAll('#agencyDashboard .dash-nav-item')[1], 'agencyDashboard'); }
function switchAgTab(tabId, btn, dashId) { const dashboard = document.getElementById(dashId); dashboard.querySelectorAll('.ag-view').forEach(el => el.classList.remove('active')); dashboard.querySelectorAll('.dash-nav-item').forEach(el => el.classList.remove('active')); document.getElementById(tabId).classList.add('active'); btn.classList.add('active'); if(dashId === 'agencyDashboard') { document.getElementById('agTitle').innerHTML = btn.innerHTML; if(tabId === 'ag-overview') setTimeout(() => { renderDashboardChart(); }, 50); } if(dashId === 'adminDashboard') document.getElementById('adminTitle').innerHTML = btn.innerHTML; if(tabId === 'ag-profiles') { isEditing = false; } if(btn.id === 'navAddProfileBtn') { clearFormOnly(); } }

// 🔥 โค้ดดึงข้อมูลแอดมิน (แก้บั๊กการแสดงผลเรียบร้อย) 🔥
async function fetchAdminData(role) {
    if(role === 'Super Admin' || role === 'Admin') {
        const {data: pendingModels, error} = await supabaseClient.from('models').select('id, name, cover_image, kyc_status, kyc_image, agency_id').eq('is_verified', false);
        if(error) { console.error(error); return; }
        
        const {data: agencies} = await supabaseClient.from('user_profiles').select('id, display_name, role');
        
        let pmHtml = '';
        (pendingModels||[]).forEach(m => {
            const agency = agencies?.find(a => a.id === m.agency_id);
            let agName = agency ? agency.display_name : 'ไม่ทราบ'; 
            let userRole = agency ? agency.role : ''; 
            let roleBadge = userRole === 'freelance' ? '<span style="color:#10b981; font-size:0.7rem;">(อิสระ)</span>' : '<span style="color:var(--dash-gold); font-size:0.7rem;">(เอเจนซี่)</span>';
            
            let kycBadge = m.kyc_status === 'pending' ? '<span style="color:#f59e0b;">⏳ รอตรวจ KYC</span>' : (m.kyc_status === 'approved' ? '<span style="color:#10b981;">✅ KYC ผ่าน</span>' : '<span style="color:#ef4444;">❌ ยังไม่มี KYC</span>');
            
            let btnHtml = `<button class="btn-glow btn-glow-sm" onclick="approveModelAdmin(${m.id})">✅ อนุมัติ</button>`;
            if(m.kyc_status === 'pending') { btnHtml = `<button class="btn-glow btn-glow-sm" style="margin-bottom:5px;" onclick="window.open('${m.kyc_image}', '_blank')">🔍 ดูรูป KYC</button>` + btnHtml; }
            
            pmHtml += `<tr><td><img src="${m.cover_image}" style="width:40px; height:40px; object-fit:cover; border-radius:50%;"></td><td>${escapeHTML(m.name)}</td><td>${kycBadge}</td><td>${escapeHTML(agName)} <br>${roleBadge}</td><td><div style="display:flex; flex-direction:column; gap:5px;">${btnHtml}</div></td></tr>`;
        });
        document.getElementById('adminApproveTableBody').innerHTML = pmHtml || '<tr><td colspan="5" align="center" style="color:#888;">ไม่มีโปรไฟล์รออนุมัติ</td></tr>';
    }
    
    if(role === 'Super Admin') {
        const {data: agencies} = await supabaseClient.from('user_profiles').select('id, display_name, wallet_balance, role').in('role', ['agency', 'freelance']);
        let awHtml = '';
        (agencies||[]).forEach(a => { 
            let roleBadge = a.role === 'freelance' ? '<span style="color:#10b981; font-size:0.7rem;">(อิสระ)</span>' : '<span style="color:var(--dash-gold); font-size:0.7rem;">(เอเจนซี่)</span>';
            awHtml += `<tr><td>${escapeHTML(a.display_name)} <br>${roleBadge}</td><td style="color:var(--dash-gold); font-weight:bold;">${a.wallet_balance} ฿</td><td><div style="display:flex; gap:5px; align-items:center;"><input type="number" id="topup_${a.id}" placeholder="ใส่ตัวเลข..." style="width:120px; background:#111; border:1px solid #333; color:#fff; padding:6px; border-radius:4px; outline:none;"><button class="btn-glow btn-glow-sm" onclick="topUpAgencyAdmin('${a.id}', ${a.wallet_balance})">เติมเงิน</button></div></td></tr>`; 
        });
        document.getElementById('adminWalletTableBody').innerHTML = awHtml || '<tr><td colspan="3" align="center" style="color:#888;">ไม่มีข้อมูลในระบบ</td></tr>';
    }
}

// 🔥 ฟังก์ชันปุ่มกดอนุมัติ และเติมเงินหลังบ้าน (ย้ายมาวางข้างนอกเพื่อไม่ให้เกิดบั๊กหาไม่เจอ) 🔥
async function approveModelAdmin(modelId) { 
    const {error} = await supabaseClient.from('models').update({is_verified: true, kyc_status: 'approved'}).eq('id', modelId); 
    if(error) alert('Error: ' + error.message); 
    else { 
        alert('✅ อนุมัติเรียบร้อย! น้องได้รับป้าย Verified แล้ว'); 
        
        // ⏳ หน่วงเวลา 0.5 วินาที ให้ Supabase เซฟข้อมูลให้เสร็จก่อนดึงตารางใหม่
        setTimeout(() => {
            fetchAdminData(currentUserSession.user.user_metadata.role); 
            fetchModels(); 
        }, 500);
    } 
}

async function topUpAgencyAdmin(agencyId, currentBalance) { 
    const inputVal = document.getElementById(`topup_${agencyId}`).value; 
    const amount = parseInt(inputVal); 
    if(!amount || amount <= 0) { alert('กรุณาใส่จำนวนเงินที่ถูกต้อง'); return; } 
    const newBalance = currentBalance + amount; 
    const {error} = await supabaseClient.from('user_profiles').update({wallet_balance: newBalance}).eq('id', agencyId); 
    if(error) alert('Error: ' + error.message); 
    else { alert(`💰 เติมเงิน ${amount} บาท สำเร็จ!`); document.getElementById(`topup_${agencyId}`).value = ''; fetchAdminData('Super Admin'); } 
}

function handlePremiumFileSelect(event) { const files = Array.from(event.target.files); for(let f of files) { if(mediaFiles.length + existingGallery.length >= 6) { alert('รวมรูปและวิดีโอสูงสุด 6 ไฟล์ครับ'); break; } if(f.type.startsWith('video/')) { if(mediaFiles.filter(m => m.type==='video').length >= 2) { alert('วิดีโอสูงสุด 2 ไฟล์ครับ'); continue; } if(f.size > 50 * 1024 * 1024) { alert(`ไฟล์ ${f.name} ใหญ่กว่า 50MB`); continue; } mediaFiles.push({ file: f, url: URL.createObjectURL(f), type: 'video' }); } else if(f.type.startsWith('image/')) { if(mediaFiles.filter(m => m.type==='image').length >= 6) { alert('รูปสูงสุด 6 ไฟล์ครับ'); continue; } if(f.size > 5 * 1024 * 1024) { alert(`ไฟล์ ${f.name} ใหญ่กว่า 5MB`); continue; } mediaFiles.push({ file: f, url: URL.createObjectURL(f), type: 'image' }); } } renderPremiumGallery(); }
function renderPremiumGallery() { const container = document.getElementById('galleryPreview'); container.innerHTML = ''; document.getElementById('mediaCountText').innerText = mediaFiles.length + existingGallery.length; existingGallery.forEach((url, idx) => { let isVid = isVideoFile(url); let innerHtml = isVid ? `<video src="${url}"></video><div class="vid-icon-overlay"><span class="iconify" data-icon="heroicons:play-circle-solid"></span></div>` : `<img src="${url}">`; container.innerHTML += `<div class="img-thumb-box">${innerHtml}<button type="button" class="btn-remove-img" onclick="existingGallery.splice(${idx},1); renderPremiumGallery();"><span class="iconify" data-icon="heroicons:x-mark"></span></button></div>`; }); mediaFiles.forEach((item, idx) => { let innerHtml = item.type === 'video' ? `<video src="${item.url}"></video><div class="vid-icon-overlay"><span class="iconify" data-icon="heroicons:play-circle-solid"></span></div>` : `<img src="${item.url}">`; container.innerHTML += `<div class="img-thumb-box" style="border-color:var(--dash-gold);">${innerHtml}<button type="button" class="btn-remove-img" onclick="mediaFiles.splice(${idx},1); renderPremiumGallery();"><span class="iconify" data-icon="heroicons:x-mark"></span></button></div>`; }); }

function editProfileById(id) {
    const model = myAgencyModels.find(m => m.id === id); if(!model) return;
    switchAgTab('ag-add', document.getElementById('navAddProfileBtn'), 'agencyDashboard');
    isEditing = true; document.getElementById('addFormTitle').innerText = "แก้ไขข้อมูลน้อง " + escapeHTML(model.name); document.getElementById('btnSubmitModel').innerHTML = '<span class="iconify" data-icon="heroicons:pencil-square"></span> อัปเดตข้อมูล'; document.getElementById('editingModelId').value = model.id; 
    document.getElementById('mName').value = model.name || ""; document.getElementById('mAge').value = model.age || ""; document.getElementById('mSlogan').value = model.slogan || ""; document.getElementById('mPrice').value = model.price || ""; 
    
    const modelLangs = model.languages ? model.languages.split(',').map(s=>s.trim()) : [];
    document.querySelectorAll('input[name="mLang"]').forEach(cb => { cb.checked = modelLangs.includes(cb.value); });
    
    document.getElementById('mProv').value = model.province || ""; updateDistrictList(model.province || ""); document.getElementById('mDist').value = model.district || ""; document.getElementById('mDist').disabled = false; 
    document.getElementById('mGen').value = model.gender || 'หญิง'; document.getElementById('mHeight').value = model.height || ""; document.getElementById('mWeight').value = model.weight || ""; document.getElementById('mChest').value = model.chest || ""; if(model.cup_size) document.getElementById('mCup').value = model.cup_size; if(model.breast_type) document.getElementById('mBreastType').value = model.breast_type; document.getElementById('mWaist').value = model.waist || ""; document.getElementById('mHips').value = model.hips || ""; document.getElementById('mLineId').value = model.line_id || ""; document.getElementById('mTele').value = model.telegram_id || ""; document.getElementById('mTwit').value = model.twitter_id || ""; document.getElementById('mDesc').value = model.description || ""; countChars(document.getElementById('mDesc')); existingGallery = model.gallery || [model.cover_image]; mediaFiles = []; renderPremiumGallery();
}

async function submitNewModel(event) { 
    event.preventDefault(); if(!currentUserSession) return; 
    if(mediaFiles.length === 0 && existingGallery.length === 0) { alert("ต้องมีรูปภาพอย่างน้อย 1 รูปครับ!"); return; } 
    
    const selectedLangs = Array.from(document.querySelectorAll('input[name="mLang"]:checked')).map(cb => cb.value).join(', ');
    if(!selectedLangs) { alert('กรุณาเลือกภาษาอย่างน้อย 1 ภาษาครับ'); return; }
    
    const btn = document.getElementById('btnSubmitModel'); const originalHtml = btn.innerHTML; btn.innerHTML = '<span class="iconify" data-icon="eos-icons:bubble-loading"></span> กำลังประมวลผล...'; 
    let uploadedUrls = []; 
    for (let item of mediaFiles) { const fExt = item.file.name.split('.').pop(); const fName = currentUserSession.user.id + '/' + Math.random().toString(36).substring(2) + '.' + fExt; const { error } = await supabaseClient.storage.from('profile_images').upload(fName, item.file); if (!error) uploadedUrls.push(supabaseClient.storage.from('profile_images').getPublicUrl(fName).data.publicUrl); } 
    const finalGallery = [...existingGallery, ...uploadedUrls]; const coverImage = finalGallery[0]; 
    
    // แปลงตัวเลข ป้องกันบั๊กส่งค่าว่างเปล่า
    const age = parseInt(document.getElementById('mAge').value) || null;
    const price = parseInt(document.getElementById('mPrice').value) || 0;
    const chest = parseInt(document.getElementById('mChest').value) || null; 
    const waist = parseInt(document.getElementById('mWaist').value) || null; 
    const hips = parseInt(document.getElementById('mHips').value) || null; 
    const height = parseInt(document.getElementById('mHeight').value) || null; 
    const weight = parseInt(document.getElementById('mWeight').value) || null; 
    
    const props = `${chest || '0'}-${waist || '0'}-${hips || '0'}`; 
    const locationStr = document.getElementById('mProv').value + " " + document.getElementById('mDist').value + " " + (document.getElementById('mVenue').value || ""); 
    
    const modelData = { 
        agency_id: currentUserSession.user.id, name: document.getElementById('mName').value, age: age, slogan: document.getElementById('mSlogan').value, price: price, 
        languages: selectedLangs, province: document.getElementById('mProv').value, district: document.getElementById('mDist').value, location: locationStr.trim(), 
        gender: document.getElementById('mGen').value, height: height, weight: weight, chest: chest, cup_size: document.getElementById('mCup').value, 
        breast_type: document.getElementById('mBreastType').value, waist: waist, hips: hips, proportions: props, line_id: document.getElementById('mLineId').value, telegram_id: document.getElementById('mTele').value, twitter_id: document.getElementById('mTwit').value, description: document.getElementById('mDesc').value, cover_image: coverImage, gallery: finalGallery, status: 'active' 
    }; 
    
    const editingId = document.getElementById('editingModelId').value; let errorMsg = null; 
    if(isEditing && editingId) { const { error } = await supabaseClient.from('models').update(modelData).eq('id', editingId); errorMsg = error ? error.message : null; } 
    else { modelData.is_verified = false; modelData.kyc_status = 'none'; const { error } = await supabaseClient.from('models').insert([modelData]); errorMsg = error ? error.message : null; } 
    if (errorMsg) { alert('❌ Error: ' + errorMsg); } else { alert(isEditing ? '✅ อัปเดตข้อมูลสำเร็จ!' : '🎉 สร้างโปรไฟล์สำเร็จ! (รอแอดมินตรวจสอบ)'); resetForm(); fetchMyProfiles(); fetchModels(); } btn.innerHTML = originalHtml; 
}

async function fetchMyProfiles() { 
    const grid = document.getElementById('myProfilesGrid'); 
    const { data } = await supabaseClient.from('models').select('*').eq('agency_id', currentUserSession.user.id).order('created_at', { ascending: false }); 
    myAgencyModels = data || []; 
    
    // อัปเดตตัวเลขจำนวนโปรไฟล์
    document.getElementById('statTotalProfiles').innerText = data ? data.length : 0; 
    const inlineStat = document.getElementById('statTotalProfilesInline');
    if(inlineStat) inlineStat.innerText = data ? data.length : 0;

    let html = ''; 
    const now = new Date(); 
    if (!data || data.length === 0) { 
        grid.innerHTML = '<div style="color:#888; grid-column:1/-1;">ยังไม่มีโปรไฟล์ในระบบ ลองสร้างโปรไฟล์แรกเลยครับ!</div>'; 
        return; 
    } 

    data.forEach(m => { 
        // ป้ายสถานะมุมขวาล่างรูป
        let statusBadge = '';
        let kycBtnHtml = '';
        if (m.is_verified) {
            statusBadge = `<div style="position:absolute; bottom:10px; right:10px; background:rgba(16, 185, 129, 0.2); border:1px solid #10b981; color:#10b981; padding:4px 10px; border-radius:50px; font-size:0.75rem; font-weight:600;"><span class="iconify" data-icon="heroicons:check"></span> ใช้งาน</div>`;
        } else if (m.kyc_status === 'pending') {
            statusBadge = `<div style="position:absolute; bottom:10px; right:10px; background:rgba(245, 158, 11, 0.2); border:1px solid #f59e0b; color:#f59e0b; padding:4px 10px; border-radius:50px; font-size:0.75rem; font-weight:600;"><span class="iconify" data-icon="heroicons:clock"></span> รอดำเนินการ</div>`;
        } else {
            statusBadge = `<div style="position:absolute; bottom:10px; right:10px; background:rgba(102, 102, 102, 0.5); border:1px solid #888; color:#fff; padding:4px 10px; border-radius:50px; font-size:0.75rem; font-weight:600;">ปิดใช้งาน</div>`;
            kycBtnHtml = `<button class="btn-ag-card-action" onclick="openKYCModal(${m.id}, '${escapeHTML(m.name)}')"><span class="iconify" data-icon="heroicons:shield-check"></span> ยืนยัน (KYC)</button>`;
        }

        // ป้ายใหม่ หรือ ป้ายดันโปรไฟล์มุมซ้ายบน
        const isBoosted = m.boost_expires_at && new Date(m.boost_expires_at) > now; 
        const topBadge = isBoosted ? 
            `<div style="position:absolute; top:10px; left:10px; background:rgba(239, 68, 68, 0.8); border:1px solid #ef4444; color:#fff; padding:4px 10px; border-radius:50px; font-size:0.75rem; font-weight:600;"><span class="iconify" data-icon="heroicons:fire-solid"></span> HOT</div>` : 
            `<div style="position:absolute; top:10px; left:10px; background:rgba(16, 185, 129, 0.2); border:1px solid #10b981; color:#10b981; padding:4px 10px; border-radius:50px; font-size:0.75rem; font-weight:600;"><span class="iconify" data-icon="heroicons:sparkles"></span> ใหม่</div>`;

        html += `
            <div class="ag-pro-card-premium">
                <div class="ag-pro-card-img-box">
                    <img src="${m.cover_image}" loading="lazy">
                    ${topBadge}
                    ${statusBadge}
                </div>
                <div class="ag-pro-card-info">
                    <div style="font-size:1.1rem; font-weight:600; color:#fff; margin-bottom:5px;">${escapeHTML(m.name)} <span style="color:#888; font-size:0.9rem; font-weight:normal;">(${m.age || '-'})</span></div>
                    <div style="color:#888; font-size:0.8rem; margin-bottom:5px; display:flex; align-items:center; gap:5px;"><span class="iconify" data-icon="mdi:map-marker" style="color:var(--dash-gold);"></span> ${m.province || '-'}, ${m.district || '-'}</div>
                    <div style="display:flex; justify-content:space-between; color:#aaa; font-size:0.8rem; margin-bottom:10px;">
                        <span>${m.proportions || '-'} (${m.breast_type || '-'})</span>
                        <span>${m.gender || 'หญิง'}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                        <span style="color:var(--dash-gold); font-weight:bold; font-size:1.1rem;">฿${m.price}</span>
                        <span style="color:#666; font-size:0.85rem;"><span class="iconify" data-icon="heroicons:heart-solid" style="color:#ff4d4f;"></span> - (0)</span>
                    </div>
                    
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        <button class="btn-ag-card-action" onclick="alert('ระบบเพิ่มสตอรี่วิดีโอกำลังจะมาเร็วๆ นี้ครับ!')"><span class="iconify" data-icon="heroicons:video-camera"></span> เพิ่มสตอรี่</button>
                        ${kycBtnHtml}
                        <button class="btn-ag-card-action" onclick="editProfileById(${m.id})"><span class="iconify" data-icon="heroicons:pencil"></span> แก้ไข</button>
                        <button class="btn-ag-card-action" onclick="alert('ระบบหยุดรับงานชั่วคราว อยู่ระหว่างพัฒนาครับ')"><span class="iconify" data-icon="heroicons:pause"></span> หยุดชั่วคราว</button>
                        <button class="btn-ag-card-action" onclick="if(confirm('ลบโปรไฟล์นี้? ข้อมูลจะหายทั้งหมด')) { supabaseClient.from('models').delete().eq('id', ${m.id}).then(()=>fetchMyProfiles()); }"><span class="iconify" data-icon="heroicons:trash"></span> ลบ</button>
                    </div>
                </div>
            </div>
        `; 
    }); 
    grid.innerHTML = html; 
}
function openKYCModal(modelId, name) { document.getElementById('kycModelId').value = modelId; document.getElementById('kycModelName').innerText = "น้อง " + escapeHTML(name); document.getElementById('kycFile').value = ''; document.getElementById('kycFileName').innerText = 'คลิกเพื่ออัปโหลดรูปถ่าย (ไม่เกิน 5MB)'; document.getElementById('kycModalOverlay').classList.add('active'); }
function closeKYCModal() { document.getElementById('kycModalOverlay').classList.remove('active'); }
async function submitKYC(event) { event.preventDefault(); const modelId = document.getElementById('kycModelId').value; const fileInput = document.getElementById('kycFile'); const btn = event.target.querySelector('button'); const originalHtml = btn.innerHTML; if(fileInput.files.length === 0) { alert('กรุณาแนบรูปถ่ายครับ'); return; } btn.innerHTML = 'กำลังส่งข้อมูล...'; const file = fileInput.files[0]; const fExt = file.name.split('.').pop(); const fName = 'kyc/' + currentUserSession.user.id + '/' + modelId + '_' + Date.now() + '.' + fExt; const { error: uploadErr } = await supabaseClient.storage.from('profile_images').upload(fName, file); if (uploadErr) { alert('อัปโหลดรูปล้มเหลว: ' + uploadErr.message); btn.innerHTML = originalHtml; return; } const kycUrl = supabaseClient.storage.from('profile_images').getPublicUrl(fName).data.publicUrl; const { error: updateErr } = await supabaseClient.from('models').update({ kyc_image: kycUrl, kyc_status: 'pending' }).eq('id', modelId); if(updateErr) alert('บันทึก KYC ล้มเหลว: ' + updateErr.message); else { alert('✅ ส่งรูปยืนยันตัวตนเรียบร้อย! โปรดรอแอดมินตรวจสอบครับ'); closeKYCModal(); fetchMyProfiles(); } btn.innerHTML = originalHtml; }
async function boostProfile(modelId) { if(!currentUserSession) return; const cost = 50; if(confirm(`ยืนยันการดันโปรไฟล์ (ใช้ ${cost} เครดิต)?\nน้องจะไปอยู่หน้าแรกเป็นเวลา 24 ชม.`)) { if(agencyWalletBalance < cost) { alert('❌ เครดิตไม่พอครับ กรุณาไปที่เมนูกระเป๋าเงินเพื่อเติมเครดิต'); switchAgTab('ag-wallet', document.querySelectorAll('#agencyDashboard .dash-nav-item')[4], 'agencyDashboard'); return; } const newBalance = agencyWalletBalance - cost; await supabaseClient.from('user_profiles').update({ wallet_balance: newBalance }).eq('id', currentUserSession.user.id); const expiresAt = new Date(); expiresAt.setHours(expiresAt.getHours() + 24); await supabaseClient.from('models').update({ boost_expires_at: expiresAt.toISOString() }).eq('id', modelId); alert('🔥 ดันโปรไฟล์สำเร็จ! น้องไปอยู่หน้าแรกแล้วครับ'); fetchWalletThemeAndAvatar(); fetchMyProfiles(); fetchModels(); } }

function setTopupAmount(amount) { document.getElementById('customTopupAmount').value = amount; }
async function generateRealQR() { const amountInput = document.getElementById('customTopupAmount').value; const amount = parseInt(amountInput); if(!amount || amount < 100) { alert("กรุณาระบุจำนวนเงินขั้นต่ำ 100 บาทครับ"); return; } if(!currentUserSession) { alert("Session หมดอายุ กรุณาล็อกอินใหม่"); return; } const btn = document.getElementById('btnGenQR'); const originalHtml = btn.innerHTML; btn.innerHTML = '<span class="iconify" data-icon="eos-icons:bubble-loading"></span> กำลังสร้าง QR Code...'; try { const response = await fetch(`${SUPABASE_URL}/functions/v1/create-qr`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }, body: JSON.stringify({ amount: amount, agency_id: currentUserSession.user.id }) }); if (!response.ok) { const errText = await response.text(); throw new Error(`การเชื่อมต่อ Edge Function มีปัญหา (Status ${response.status})`); } const data = await response.json(); if (data.error) { throw new Error(data.error); } document.getElementById('omiseQrImage').src = data.qr_url; document.getElementById('qrAmountDisplay').innerText = amount.toLocaleString(); document.getElementById('qrModalOverlay').classList.add('active'); alert("🎉 สร้าง QR Code จาก Omise สำเร็จ!\n(สามารถจำลองการจ่ายได้ในเว็บ Omise เลยครับ)"); const oldBalance = agencyWalletBalance; const checkInterval = setInterval(async () => { if(!document.getElementById('qrModalOverlay').classList.contains('active')) { clearInterval(checkInterval); return; } await fetchWalletThemeAndAvatar(); if(agencyWalletBalance > oldBalance) { clearInterval(checkInterval); alert(`✅ การชำระเงินสำเร็จ!\nระบบได้เติมเครดิต ${amount} บาท เข้ากระเป๋าเรียบร้อยแล้วครับ`); closeQRModal(); document.getElementById('customTopupAmount').value = ''; } }, 3000); } catch (error) { console.error(error); alert("❌ เกิดข้อผิดพลาดจากธนาคาร: " + error.message); } btn.innerHTML = originalHtml; }
function closeQRModal() { document.getElementById('qrModalOverlay').classList.remove('active'); }

async function fetchAgenciesPublic() { const container = document.getElementById('agencyListGrid'); container.innerHTML = '<div class="no-results"><span class="iconify" data-icon="eos-icons:bubble-loading"></span> กำลังโหลดข้อมูล...</div>'; const { data, error } = await supabaseClient.from('user_profiles').select('id, display_name, role, avatar_url').in('role', ['agency', 'freelance']); if(error || !data || data.length === 0) { container.innerHTML = '<div class="no-results">ยังไม่มีข้อมูลในระบบ</div>'; return; } let html = ''; data.forEach(user => { const badgeClass = user.role === 'freelance' ? 'background:#10b981;' : 'background:var(--accent);'; const badgeText = user.role === 'freelance' ? '✨ รับงานอิสระ' : '🏢 เอเจนซี่'; const avatarHtml = user.avatar_url ? `<img src="${user.avatar_url}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">` : `${user.display_name.charAt(0).toUpperCase()}`; html += `<div class="agency-public-card"><div class="ag-public-avatar" style="overflow:hidden;">${avatarHtml}</div><h3 style="color:var(--text-dark); margin-bottom:5px;">${escapeHTML(user.display_name)}</h3><span style="${badgeClass} color:#fff; font-size:0.75rem; padding:3px 10px; border-radius:50px; font-weight:500;">${badgeText}</span><button class="btn-outline" style="width:100%; margin-top:15px;">ดูโปรไฟล์น้องๆ</button></div>`; }); container.innerHTML = html; }
async function fetchModels() { const { data, error } = await supabaseClient.from('models').select('*, user_profiles(theme_color)').eq('status', 'active').order('boost_expires_at', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false }); if (error || !data) return; allModelsData = data; handleSearch(); }
async function fetchLeaderboard() { const container = document.getElementById('leaderboardGrid'); const topModels = [...allModelsData].sort((a,b) => b.rating_avg - a.rating_avg).slice(0, 10); if(topModels.length === 0) { container.innerHTML = '<div class="no-results">ยังไม่มีข้อมูลน้องๆ ครับ</div>'; return; } let html = ''; const now = new Date(); topModels.forEach((model, index) => { const rankClass = index === 0 ? 'rank-badge' : (index === 1 ? 'rank-badge rank-2' : (index === 2 ? 'rank-badge rank-3' : 'rank-badge')); const ratingAvg = model.rating_avg > 0 ? parseFloat(model.rating_avg).toFixed(1) : 'New'; const verifiedBadgeHtml = model.is_verified ? '<span class="iconify verified-badge-small" data-icon="heroicons:check-badge-solid"></span>' : ''; html += `<div class="card" onclick="viewProfileById(${model.id})" style="position:relative;"><div class="${rankClass}">#${index+1}</div><div class="card-image-box"><img src="${model.cover_image}" loading="lazy"></div><div class="card-info"><div class="name-group">${verifiedBadgeHtml}<span class="card-name">${escapeHTML(model.name)}</span></div><div class="card-location"><span class="iconify" data-icon="mdi:map-marker" style="color: var(--accent);"></span> ${escapeHTML(model.location)}</div><div class="card-footer"><div class="price">฿${model.price}</div><div class="engagement"><span class="iconify" data-icon="heroicons:star-solid" style="color: #fbbf24;"></span> ${ratingAvg}</div></div></div></div>`; }); container.innerHTML = html; }
function selectStar(val) { selectedRating = val; const stars = document.querySelectorAll('#starRatingSelector .iconify'); stars.forEach(s => { if(parseInt(s.getAttribute('data-val')) <= val) s.classList.add('selected'); else s.classList.remove('selected'); }); }
async function submitReview(event) { event.preventDefault(); if(!currentUserSession || !currentProfileId) return; const comment = document.getElementById('reviewComment').value.trim(); const btn = document.getElementById('btnSubmitReview'); btn.innerText = 'กำลังส่ง...'; const { error } = await supabaseClient.from('reviews').insert([{ model_id: currentProfileId, user_id: currentUserSession.user.id, rating: selectedRating, comment: comment }]); if(error) alert("❌ Error: " + error.message); else { document.getElementById('reviewComment').value = ''; selectStar(5); loadReviews(currentProfileId); fetchModels(); } btn.innerText = 'ส่งรีวิว'; }
async function loadReviews(modelId) { const listContainer = document.getElementById('reviewsList'); const countDisplay = document.getElementById('pdReviewCount'); const { data, error } = await supabaseClient.from('reviews').select(`rating, comment, created_at, user_profiles!inner(display_name)`).eq('model_id', modelId).order('created_at', { ascending: false }); if(error || !data) return; countDisplay.innerText = data.length; if(data.length === 0) { listContainer.innerHTML = '<p style="color:#888; text-align:center;">ยังไม่มีรีวิว</p>'; return; } let html = ''; data.forEach(r => { const starsHtml = '<span class="iconify" data-icon="heroicons:star-solid"></span>'.repeat(r.rating) + '<span class="iconify" data-icon="heroicons:star" style="color:#444;"></span>'.repeat(5 - r.rating); html += `<div class="review-card"><div class="review-header"><span class="review-user">${escapeHTML(r.user_profiles.display_name)}</span></div><div class="review-stars">${starsHtml}</div><div class="review-text">${escapeHTML(r.comment)}</div></div>`; }); listContainer.innerHTML = html; }
async function fetchUserFavorites() { if(!currentUserSession) return; const { data, error } = await supabaseClient.from('favorites').select('model_id').eq('user_id', currentUserSession.user.id); if(!error && data) { userFavorites = data.map(f => f.model_id); handleSearch(); } }
async function toggleHeartReal(modelId, btn, event) { if(event) event.stopPropagation(); if(!currentUserSession) { alert("กรุณาล็อกอินก่อนครับ"); return; } const icon = btn.querySelector('.iconify'); const isLiked = userFavorites.includes(modelId); if (isLiked) { icon.setAttribute('data-icon', 'mdi:cards-heart-outline'); icon.style.color = 'white'; btn.style.borderColor = 'rgba(255, 255, 255, 0.3)'; userFavorites = userFavorites.filter(id => id !== modelId); await supabaseClient.from('favorites').delete().match({ user_id: currentUserSession.user.id, model_id: modelId }); } else { icon.setAttribute('data-icon', 'mdi:cards-heart'); icon.style.color = '#ff4d4f'; btn.style.borderColor = '#ff4d4f'; userFavorites.push(modelId); await supabaseClient.from('favorites').insert([{ user_id: currentUserSession.user.id, model_id: modelId }]); } }
let currentFilter = 'all'; function setFilter(filterType, btnElement) { currentFilter = filterType; document.querySelectorAll('.filter-chips .chip').forEach(c => c.classList.remove('active')); btnElement.classList.add('active'); handleSearch(); }
function handleSearch() { const searchText = document.getElementById('searchInput').value.toLowerCase(); let filteredData = allModelsData.filter(model => { const matchSearch = model.name.toLowerCase().includes(searchText) || (model.location && model.location.toLowerCase().includes(searchText)); let matchFilter = true; if (currentFilter === 'new') { const diffTime = Math.abs(new Date() - new Date(model.created_at)); matchFilter = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= 7; } else if (currentFilter === 'budget') { matchFilter = model.price < 2000; } else if (currentFilter === 'favorite') { matchFilter = userFavorites.includes(model.id); } return matchSearch && matchFilter; }); renderGrid(filteredData); }
function renderGrid(dataToRender) { const grid = document.getElementById('modelsGrid'); if (dataToRender.length === 0) { grid.innerHTML = '<div class="no-results">ไม่พบน้องๆ ครับ 🥲</div>'; return; } let html = ''; const now = new Date(); dataToRender.forEach(model => { const isFav = userFavorites.includes(model.id); const heartIcon = isFav ? 'mdi:cards-heart' : 'mdi:cards-heart-outline'; const heartColor = isFav ? '#ff4d4f' : 'white'; const heartBorder = isFav ? '#ff4d4f' : 'rgba(255, 255, 255, 0.3)'; const ratingAvg = model.rating_avg > 0 ? parseFloat(model.rating_avg).toFixed(1) : 'New'; const isBoosted = model.boost_expires_at && new Date(model.boost_expires_at) > now; const badgeHtml = isBoosted ? '<span class="badge-hot"><span class="iconify" data-icon="heroicons:fire-solid"></span> HOT</span>' : '<span class="badge-image">New</span>'; const verifiedBadgeHtml = model.is_verified ? '<span class="iconify verified-badge-small" data-icon="heroicons:check-badge-solid"></span>' : ''; html += `<div class="card" onclick="viewProfileById(${model.id})"><div class="card-image-box"><img src="${model.cover_image}" loading="lazy">${badgeHtml}<button class="heart-btn-card" style="border-color: ${heartBorder};" onclick="toggleHeartReal(${model.id}, this, event)"><span class="iconify heart-icon" data-icon="${heartIcon}" style="color: ${heartColor}; font-size: 1.5rem;"></span></button></div><div class="card-info"><div class="name-group">${verifiedBadgeHtml}<span class="card-name">${escapeHTML(model.name)}</span></div><div class="card-location"><span class="iconify" data-icon="mdi:map-marker" style="color: var(--accent);"></span> ${escapeHTML(model.location)}</div><div class="card-footer"><div class="price">฿${model.price}</div><div class="engagement"><span class="iconify" data-icon="heroicons:star-solid" style="color: #fbbf24;"></span> ${ratingAvg}</div></div></div></div>`; }); grid.innerHTML = html; }
window.setMainMedia = function(url, isVideo, thumbElement) { const imgEl = document.getElementById('pdMainImage'); const vidEl = document.getElementById('pdMainVideo'); if (isVideo) { imgEl.style.display = 'none'; vidEl.style.display = 'block'; vidEl.src = url; vidEl.play(); } else { vidEl.style.display = 'none'; vidEl.pause(); imgEl.style.display = 'block'; imgEl.src = url; } document.querySelectorAll('.pro-thumb-item').forEach(el => el.classList.remove('active')); if(thumbElement) thumbElement.classList.add('active'); };
function viewProfileById(id) { const model = allModelsData.find(m => m.id === id); if(!model) return; currentProfileId = model.id; const agencyTheme = model.user_profiles?.theme_color || 'default'; applyTheme(agencyTheme); const images = (model.gallery && model.gallery.length > 0) ? model.gallery : [model.cover_image]; setMainMedia(images[0], isVideoFile(images[0]), null); const thumbList = document.getElementById('pdThumbList'); thumbList.innerHTML = ''; if (images.length > 1) { images.forEach((url, idx) => { const isVid = isVideoFile(url) ? true : false; const innerHtml = isVid ? `<video src="${url}"></video><div class="vid-icon-overlay" style="font-size:1rem;"><span class="iconify" data-icon="heroicons:play-circle-solid"></span></div>` : `<img src="${url}">`; thumbList.innerHTML += `<div class="pro-thumb-item ${idx === 0 ? 'active' : ''}" onclick="setMainMedia('${url}', ${isVid}, this)">${innerHtml}</div>`; }); thumbList.style.display = 'flex'; } else { thumbList.style.display = 'none'; } document.getElementById('pdName').innerText = model.name; const slg = document.getElementById('pdSlogan'); if(model.slogan) { slg.innerText = `"${model.slogan}"`; slg.style.display = 'block'; } else { slg.style.display = 'none'; } document.getElementById('pdLoc').innerText = model.location; document.getElementById('pdAge').innerText = model.age || '-'; document.getElementById('pdProps').innerText = model.proportions || '-'; const cupTxt = model.cup_size ? `${model.cup_size} (${model.breast_type || 'ไม่ระบุ'})` : '-'; document.getElementById('pdCup').innerText = cupTxt; document.getElementById('pdHeight').innerText = model.height || '-'; document.getElementById('pdWeight').innerText = model.weight || '-'; document.getElementById('pdLang').innerText = model.languages || '-'; document.getElementById('pdPrice').innerText = model.price; document.getElementById('pdDesc').innerText = model.description || '-'; let rawLine = model.line_id || ''; let lineUrl = rawLine; if (!rawLine.startsWith('http')) { lineUrl = rawLine.startsWith('@') ? `https://line.me/R/ti/p/${rawLine}` : `https://line.me/ti/p/~${rawLine}`; } document.getElementById('btnBookNow').onclick = function() { window.open(lineUrl, '_blank'); }; const teleBtn = document.getElementById('pdTeleBtn'); const twitBtn = document.getElementById('pdTwitBtn'); const socContainer = document.getElementById('pdSocialsContainer'); let hasSocials = false; if(model.telegram_id) { teleBtn.style.display = 'flex'; teleBtn.href = `https://t.me/${model.telegram_id.replace('@','')}`; hasSocials = true; } else { teleBtn.style.display = 'none'; } if(model.twitter_id) { twitBtn.style.display = 'flex'; twitBtn.href = `https://x.com/${model.twitter_id.replace('@','')}`; hasSocials = true; } else { twitBtn.style.display = 'none'; } socContainer.style.display = hasSocials ? 'flex' : 'none'; const modalHeartBtn = document.getElementById('btnProHeart'); const icon = modalHeartBtn.querySelector('.iconify'); const isFav = userFavorites.includes(model.id); icon.setAttribute('data-icon', isFav ? 'mdi:cards-heart' : 'mdi:cards-heart-outline'); icon.style.color = isFav ? '#ff4d4f' : 'white'; modalHeartBtn.style.borderColor = isFav ? '#ff4d4f' : 'rgba(255, 255, 255, 0.3)'; modalHeartBtn.onclick = function() { toggleHeartReal(model.id, this, null); }; loadReviews(model.id); document.getElementById('profileDetailModal').classList.add('active'); document.body.classList.add('modal-open'); }
function closeProfile() { document.getElementById('profileDetailModal').classList.remove('active'); document.body.classList.remove('modal-open'); document.getElementById('pdMainVideo').pause(); if(!currentUserSession || (currentUserSession.user.user_metadata.role !== 'agency' && currentUserSession.user.user_metadata.role !== 'freelance')) { applyTheme('default'); } else { applyTheme(myCurrentTheme); } }
function switchAuthTab(tab) { document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active')); if(tab === 'login') document.getElementById('loginForm').classList.add('active'); else if(tab === 'register') document.getElementById('registerForm').classList.add('active'); else if(tab === 'forgot') document.getElementById('forgotForm').classList.add('active'); else if(tab === 'updatePwd') document.getElementById('updatePwdForm').classList.add('active'); }
function openAuthModal(tab = 'login') { switchMainView('authView', null); switchAuthTab(tab); }
function closeAuthModal() { switchMainView('homeView', document.getElementById('navHome')); }
async function handleForgotPassword(event) { event.preventDefault(); const email = document.getElementById('forgotEmail').value.trim(); const btn = event.target.querySelector('button'); const originalText = btn.innerText; btn.innerText = 'กำลังส่ง...'; const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin }); if (error) { alert('❌ เกิดข้อผิดพลาด: ' + error.message); } else { alert('✅ ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลของคุณแล้วครับ!'); switchAuthTab('login'); } btn.innerText = originalText; }
async function handleUpdatePassword(event) { event.preventDefault(); const newPassword = document.getElementById('newPassword').value; const btn = event.target.querySelector('button'); const originalText = btn.innerText; btn.innerText = 'กำลังอัปเดต...'; const { data, error } = await supabaseClient.auth.updateUser({ password: newPassword }); if (error) { alert('❌ เกิดข้อผิดพลาด: ' + error.message); } else { alert('🎉 เปลี่ยนรหัสผ่านสำเร็จ!'); closeAuthModal(null, true); document.getElementById('loginPassword').value = ''; openAuthModal('login'); } btn.innerText = originalText; }

async function handleAuthSubmit(event, type) {
    event.preventDefault(); const submitBtn = event.target.querySelector('button[type="submit"]'); const originalText = submitBtn.innerText; submitBtn.innerText = 'ประมวลผล...';
    if (type === 'login') {
        let loginId = document.getElementById('loginEmail').value.trim(); let password = document.getElementById('loginPassword').value; let emailToUse = loginId; let isSecretAdmin = false; let secretRole = "";
        if (secretAdmins[loginId] && secretAdmins[loginId].pwd === password) { emailToUse = secretAdmins[loginId].email; isSecretAdmin = true; secretRole = secretAdmins[loginId].role; }
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email: emailToUse, password: password });
        if (error) { if (isSecretAdmin && error.message.includes('Invalid login credentials')) { const { error: regError } = await supabaseClient.auth.signUp({ email: emailToUse, password: password, options: { data: { username: loginId, display_name: secretRole, role: secretRole } } }); if (!regError) { alert('✅ สร้างบัญชีผู้ดูแลระบบสำเร็จและเข้าสู่ระบบแล้ว'); closeAuthModal(null, true); event.target.reset(); } else { alert('❌ ตั้งค่าแอดมินล้มเหลว: ' + regError.message); } } else { alert('❌ ข้อมูลเข้าสู่ระบบไม่ถูกต้อง'); } } else { closeAuthModal(null, true); event.target.reset(); }
    } else if (type === 'register') {
        const pwd = document.getElementById('regPassword').value; 
        if(pwd !== document.getElementById('regConfirmPassword').value) { alert('❌ รหัสผ่านไม่ตรงกัน'); submitBtn.innerText = originalText; return; }
        
        // 🔥 ดึงรหัสแนะนำเพื่อนจากช่องกรอก
        const referralCode = document.getElementById('regReferral').value.trim();
        
        // 🔥 สร้างรหัสแนะนำตัวของตัวเองแบบสุ่ม (เช่น A1B2C3)
        const myNewReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const { error } = await supabaseClient.auth.signUp({ 
            email: document.getElementById('regEmail').value, 
            password: pwd, 
            options: { 
                data: { 
                    username: document.getElementById('regUsername').value, 
                    display_name: document.getElementById('regDisplayName').value || document.getElementById('regUsername').value, 
                    role: document.querySelector('input[name="member_type"]:checked').value,
                    my_referral_code: myNewReferralCode, // บันทึกรหัสตัวเอง
                    referred_by: referralCode // บันทึกว่าใครชวนมา
                } 
            } 
        });
        
        if (error) alert('❌ ' + error.message); else { alert('✅ สมัครสมาชิกสำเร็จ!'); closeAuthModal(null, true); event.target.reset(); }
    }
    submitBtn.innerText = originalText;
}

async function handleLogout() { await supabaseClient.auth.signOut(); updateUIAuth(null); closeDashboard(); fetchModels(); switchMainView('homeView', document.getElementById('navHome')); }

fetchModels();
function copyReferralCode() {
    const code = document.getElementById('myReferralCodeDisplay').innerText;
    if(code && code !== '------') {
        navigator.clipboard.writeText(code);
        alert('คัดลอกรหัสแนะนำเรียบร้อยแล้ว: ' + code);
    }
}
