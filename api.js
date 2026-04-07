// ตั้งค่า Supabase [cite: 195]
const SUPABASE_URL = 'https://ryensvsewntmflahpacp.supabase.co'; [cite: 195]
const SUPABASE_ANON_KEY = 'sb_publishable_rYAnbJukdoUm6ilIeK0j_w_IO6R_i8L'; [cite: 195]
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); [cite: 195]

// ตัวแปร Global [cite: 196, 197]
let currentUserSession = null; [cite: 196]
let allModelsData = []; [cite: 196]
let userFavorites = []; [cite: 196]
let myAgencyModels = []; [cite: 196]
let agencyWalletBalance = 0; [cite: 197]
let myCurrentTheme = 'default'; [cite: 197]

// ฟังก์ชันดึงข้อมูลน้องๆ หน้าแรก [cite: 360]
async function fetchModels() { 
    const { data, error } = await supabaseClient.from('models')
        .select('*, user_profiles(theme_color)')
        .eq('status', 'active')
        .order('boost_expires_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false }); [cite: 360]
    if (error || !data) return; [cite: 361]
    allModelsData = data; [cite: 361]
    handleSearch(); // เรียกฟังก์ชันค้นหาจาก ui.js [cite: 361]
}

// ฟังก์ชันดึงรายการที่ถูกใจ [cite: 374]
async function fetchUserFavorites() { 
    if(!currentUserSession) return; [cite: 374]
    const { data, error } = await supabaseClient.from('favorites')
        .select('model_id')
        .eq('user_id', currentUserSession.user.id); [cite: 374]
    if(!error && data) { 
        userFavorites = data.map(f => f.model_id); [cite: 375]
        handleSearch(); [cite: 375]
    } 
}
