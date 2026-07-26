// ═══ Nether Agent — Mini App Logic ═══

const API_BASE = ''; // آدرس ربات روی هاست
const tg = window.Telegram?.WebApp;

if (tg) {
    tg.expand();
    tg.setHeaderColor('#090909');
    tg.setBackgroundColor('#090909');
}

let initData = tg?.initData || '';
let isOperator = false;

// ═══ Init ═══
async function init() {
    if (!initData) {
        showScreen('adScreen');
        return;
    }

    try {
        const data = await apiCall('/api/settings');
        
        if (data.error === 'unauthorized' || data.error === 'not_found') {
            // کاربر ادمین نیست → صفحه تبلیغ
            showScreen('adScreen');
            return;
        }

        isOperator = data.is_operator;
        
        // آپدیت status
        const dot = document.getElementById('statusDot');
        const txt = document.getElementById('statusText');
        if (data.ai_provider) {
            dot.classList.add('active');
            txt.textContent = isOperator ? 'اوپراتور' : 'ادمین';
        } else {
            txt.textContent = 'تنظیم نشده';
        }

        populateForm(data);
        await loadSources();
        showScreen('dashboard');
    } catch (e) {
        console.error('Init failed:', e);
        showScreen('adScreen');
    }
}

// ═══ API ═══
async function apiCall(endpoint, method = 'GET', body = null) {
    const opts = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'X-Telegram-Init-Data': initData,
        },
    };
    if (body) opts.body = JSON.stringify(body);

    try {
        const resp = await fetch(`${API_BASE}${endpoint}`, opts);
        return await resp.json();
    } catch (e) {
        console.error('API call failed:', e);
        throw e;
    }
}

// ═══ Show Screen ═══
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
    // loading رو پنهان کن
    document.getElementById('loading').classList.remove('active');
}

// ═══ Populate Form ═══
function populateForm(data) {
    if (data.ai_provider) document.getElementById('ai_provider').value = data.ai_provider;
    if (data.ai_api_key) {
        document.getElementById('ai_api_key').value = data.ai_api_key;
        document.getElementById('api_key_hint').textContent = '✅ تنظیم شده';
    }
    if (data.ai_model) document.getElementById('ai_model').value = data.ai_model;
    if (data.signature) document.getElementById('signature').value = data.signature;
    if (data.channel_id) document.getElementById('channel_id').value = data.channel_id;
    if (data.autopost_enabled) document.getElementById('autopost_enabled').checked = true;
    if (data.collection_interval) document.getElementById('collection_interval').value = data.collection_interval;
    
    const wmStatus = document.getElementById('watermark_status');
    if (data.watermark_path) {
        wmStatus.textContent = '✅ واترمارک تنظیم شده';
    } else {
        wmStatus.textContent = '❌ واترمارک تنظیم نشده';
    }

    if (data.rubika_enabled) document.getElementById('rubika_enabled').checked = true;
    if (data.rubika_token) document.getElementById('rubika_token').value = data.rubika_token;
    if (data.rubika_admin_id) document.getElementById('rubika_admin_id').value = data.rubika_admin_id;
    if (data.rubika_channel_id) document.getElementById('rubika_channel_id').value = data.rubika_channel_id;
}

// ═══ Load Sources ═══
async function loadSources() {
    try {
        const data = await apiCall('/api/sources');
        const container = document.getElementById('current_sources');
        if (!data.sources || data.sources.length === 0) {
            container.innerHTML = '<p class="field-hint">هیچ منبعی اضافه نشده.</p>';
            return;
        }
        container.innerHTML = data.sources.map(s => `
            <div class="source-item">
                <span class="src-type">${s.source_type}</span>
                <span class="src-url">${s.url}</span>
                <span class="src-delete" onclick="removeSource(${s.id})">✕</span>
            </div>
        `).join('');
    } catch (e) {
        console.error('Load sources failed:', e);
    }
}

// ═══ Add Sources ═══
async function addSources() {
    const text = document.getElementById('sources_list').value.trim();
    if (!text) return;

    const urls = text.split('\n').map(l => l.trim()).filter(l => l.startsWith('https://'));
    if (urls.length === 0) {
        showStatus('لینک‌ها باید با https:// شروع بشن', 'error');
        return;
    }

    try {
        const data = await apiCall('/api/sources', 'POST', { urls });
        if (data.added > 0) {
            showStatus(`${data.added} منبع اضافه شد`, 'success');
            document.getElementById('sources_list').value = '';
            loadSources();
            if (tg) tg.HapticFeedback.notificationOccurred('success');
        } else {
            showStatus('هیچ منبع جدیدی اضافه نشد', 'error');
        }
    } catch (e) {
        showStatus('خطا در افزودن منابع', 'error');
    }
}

// ═══ Remove Source ═══
async function removeSource(id) {
    try {
        await apiCall(`/api/sources/${id}`, 'DELETE');
        loadSources();
        showStatus('منبع حذف شد', 'success');
    } catch (e) {
        showStatus('خطا در حذف منبع', 'error');
    }
}

// ═══ Remove Watermark ═══
async function removeWatermark() {
    try {
        await apiCall('/api/watermark', 'DELETE');
        document.getElementById('watermark_status').textContent = '❌ واترمارک حذف شد';
        showStatus('واترمارک حذف شد', 'success');
    } catch (e) {
        showStatus('خطا در حذف واترمارک', 'error');
    }
}

// ═══ Save Settings ═══
async function saveSettings() {
    const data = {
        ai_provider: document.getElementById('ai_provider').value,
        ai_api_key: document.getElementById('ai_api_key').value,
        ai_model: document.getElementById('ai_model').value,
        signature: document.getElementById('signature').value,
        channel_id: document.getElementById('channel_id').value,
        autopost_enabled: document.getElementById('autopost_enabled').checked,
        collection_interval: parseInt(document.getElementById('collection_interval').value),
        rubika_enabled: document.getElementById('rubika_enabled').checked,
        rubika_token: document.getElementById('rubika_token').value,
        rubika_admin_id: document.getElementById('rubika_admin_id').value,
        rubika_channel_id: document.getElementById('rubika_channel_id').value,
    };

    try {
        await apiCall('/api/settings', 'POST', data);
        showStatus('✅ تنظیمات ذخیره شد', 'success');
        if (tg) tg.HapticFeedback.notificationOccurred('success');
    } catch (e) {
        showStatus('❌ خطا در ذخیره', 'error');
    }
}

// ═══ Show Status ═══
function showStatus(msg, type) {
    const el = document.getElementById('save_status');
    el.textContent = msg;
    el.className = `save-status ${type}`;
    setTimeout(() => { el.textContent = ''; el.className = 'save-status'; }, 3000);
}

// ═══ Tab Switching ═══
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
        if (tg) tg.HapticFeedback.impactOccurred('light');
    });
});

// ═══ Start ═══
init();
