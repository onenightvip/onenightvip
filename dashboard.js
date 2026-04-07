// เปิด Dashboard ตาม Role [cite: 245]
function openDashboardRouter() {
    if(!currentUserSession) return; [cite: 245]
    const role = currentUserSession.user.user_metadata.role; [cite: 245]
    if(role === 'Super Admin' || role === 'Admin') { 
        setupAdminDashboard(role); [cite: 246]
        document.getElementById('adminDashboard').classList.add('active'); [cite: 246]
    } else { 
        document.getElementById('agencyDashboard').classList.add('active'); [cite: 247]
        fetchMyProfiles(); [cite: 248]
    }
}

// ดึงโปรไฟล์ที่ตัวเองเป็นคนลง [cite: 315]
async function fetchMyProfiles() { 
    const { data } = await supabaseClient.from('models')
        .select('*')
        .eq('agency_id', currentUserSession.user.id); [cite: 316]
    // ... logic วาดโปรไฟล์ [cite: 317, 319]
}

// แอดมินอนุมัติโปรไฟล์ [cite: 275]
async function approveModelAdmin(modelId) { 
    const {error} = await supabaseClient.from('models')
        .update({is_verified: true, kyc_status: 'approved'})
        .eq('id', modelId); [cite: 275]
    if(!error) { 
        alert('✅ อนุมัติเรียบร้อย!'); 
        fetchAdminData(currentUserSession.user.user_metadata.role); [cite: 276]
    } 
}
