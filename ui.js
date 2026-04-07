// สลับหน้า View หลัก [cite: 207]
function switchMainView(viewId, navBtn) { 
    document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none'); [cite: 207]
    document.getElementById(viewId).style.display = 'block'; [cite: 207]
    document.querySelectorAll('.nav-links a').forEach(el => el.classList.remove('active')); [cite: 207]
    if(navBtn) navBtn.classList.add('active'); [cite: 207]
}

// ระบบค้นหาและ Filter [cite: 381]
function handleSearch() { 
    const searchText = document.getElementById('searchInput').value.toLowerCase(); [cite: 380]
    let filteredData = allModelsData.filter(model => { 
        const matchSearch = model.name.toLowerCase().includes(searchText); [cite: 381]
        // ... logic filter อื่นๆ [cite: 381]
        return matchSearch; [cite: 381]
    });
    renderGrid(filteredData); [cite: 382]
}

// วาด Card น้องๆ ลงหน้าเว็บ [cite: 384]
function renderGrid(dataToRender) {
    const grid = document.getElementById('modelsGrid'); [cite: 382]
    let html = ''; 
    dataToRender.forEach(model => {
        html += `<div class="card" onclick="viewProfileById(${model.id})">...</div>`; [cite: 384, 385]
    });
    grid.innerHTML = html; [cite: 385]
}
function showSkeleton() {
    const grid = document.getElementById('modelsGrid');
    let skeletonHtml = '';
    // สร้างการ์ดเปล่า 8 ใบ
    for (let i = 0; i < 8; i++) {
        skeletonHtml += `
            <div class="card skeleton-card">
                <div class="skeleton-img" style="background: #eee; height: 380px; border-radius: 12px; margin-bottom: 15px;"></div>
                <div class="skeleton-text" style="background: #eee; height: 20px; width: 60%; margin-bottom: 10px; border-radius: 4px;"></div>
                <div class="skeleton-text" style="background: #eee; height: 15px; width: 40%; border-radius: 4px;"></div>
            </div>
        `;
    }
    grid.innerHTML = skeletonHtml;
}
