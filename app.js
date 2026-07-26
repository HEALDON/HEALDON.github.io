// ═══════════════════════════════════════════════════════
//  NETHER AGENT — React Mini App
//  Professional Control Center
// ═══════════════════════════════════════════════════════

// ⚙️ تنظیمات — آدرس هاست ربات
const API_BASE = 'https://healdon.ir';

const { useState, useEffect, useCallback } = React;
const tg = window.Telegram?.WebApp;
if (tg) { tg.expand(); tg.setHeaderColor('#090909'); tg.setBackgroundColor('#090909'); }
const initData = tg?.initData || '';

// ═══ API ═══
async function api(endpoint, method='GET', body=null) {
    const opts = { method, headers: { 'Content-Type':'application/json', 'X-Telegram-Init-Data': initData } };
    if (body) opts.body = JSON.stringify(body);
    const r = await fetch(`${API_BASE}${endpoint}`, opts);
    return r.json();
}

// ═══ Icons ═══
const I = {
    dashboard: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>,
    ai: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>,
    sources: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>,
    posts: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6M9 13h6M9 17h3"/></svg>,
    channel: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M17 2l-5 4-5-4"/></svg>,
    rubika: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/></svg>,
    profile: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>,
    sub: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg>,
};

// ═══ Toast Hook ═══
function useToast() {
    const [toast, setToast] = useState(null);
    const show = useCallback((msg, type='') => { setToast({msg, type}); setTimeout(()=>setToast(null), 2500); }, []);
    return { toast, show };
}

// ═══ Dashboard View ═══
function Dashboard({ data, onNav }) {
    return (
        <div className="fade-in">
            <div className="stats-grid">
                <div className="stat-card"><div className="stat-val">{data.pending_count || 0}</div><div className="stat-label">پست در انتظار</div></div>
                <div className="stat-card green"><div className="stat-val">{data.published_count || 0}</div><div className="stat-label">پست منتشرشده</div></div>
                <div className="stat-card cyan"><div className="stat-val">{data.sources_count || 0}</div><div className="stat-label">منابع فعال</div></div>
                <div className="stat-card"><div className="stat-val">{data.collection_interval || 30}m</div><div className="stat-label">فاصله جمع‌آوری</div></div>
            </div>
            <div className="card">
                <div className="card-head"><span className="card-icon">🤖</span><span className="card-title">وضعیت ایجنت</span></div>
                <div className="toggle-row" style={{marginBottom:'10px'}}>
                    <span style={{fontSize:'13px',color:'var(--text-2)'}}>اتوپست</span>
                    <span style={{fontSize:'13px',color:data.autopost?'var(--success)':'var(--text-3)'}}>{data.autopost ? '✅ فعال' : '❌ غیرفعال'}</span>
                </div>
                <div className="toggle-row" style={{marginBottom:'10px'}}>
                    <span style={{fontSize:'13px',color:'var(--text-2)'}}>جمع‌آوری</span>
                    <span style={{fontSize:'13px',color:data.collection_on?'var(--success)':'var(--text-3)'}}>{data.collection_on ? '✅ فعال' : '⏸ متوقف'}</span>
                </div>
                <div className="toggle-row">
                    <span style={{fontSize:'13px',color:'var(--text-2)'}}>Provider</span>
                    <span style={{fontSize:'13px',color:'var(--accent)'}}>{data.ai_provider || '—'}</span>
                </div>
            </div>
            <div className="card" onClick={() => onNav('posts')} style={{cursor:'pointer'}}>
                <div className="card-head"><span className="card-icon">📋</span><span className="card-title">پست‌های در انتظار</span>{data.pending_count > 0 && <span className="card-badge">{data.pending_count}</span>}</div>
                <p style={{fontSize:'12px',color:'var(--text-3)'}}>برای مرور و تأیید پست‌ها کلیک کنید</p>
            </div>
        </div>
    );
}

// ═══ AI Settings View ═══
function AISettings({ settings, onSave, show }) {
    const [form, setForm] = useState(settings);
    useEffect(() => setForm(settings), [settings]);
    const set = (k,v) => setForm(f => ({...f, [k]: v}));
    const save = () => onSave(form);
    return (
        <div className="fade-in">
            <div className="card">
                <div className="card-head"><span className="card-icon">🤖</span><span className="card-title">Provider</span></div>
                <select className="field" value={form.ai_provider||''} onChange={e=>set('ai_provider',e.target.value)}>
                    <option value="openrouter">OpenRouter (رایگان)</option><option value="gemini">Gemini (رایگان)</option>
                    <option value="deepseek">DeepSeek</option><option value="openmodel">OpenModel</option>
                </select>
            </div>
            <div className="card">
                <div className="card-head"><span className="card-icon">🔑</span><span className="card-title">API Key</span></div>
                <input type="password" className="field" placeholder="کلید API" value={form.ai_api_key||''} onChange={e=>set('ai_api_key',e.target.value)} />
                <p className="field-hint">{form.ai_api_key ? '✅ تنظیم شده' : '—'}</p>
            </div>
            <div className="card">
                <div className="card-head"><span className="card-icon">🧠</span><span className="card-title">مدل</span></div>
                <input type="text" className="field" placeholder="نام مدل" value={form.ai_model||''} onChange={e=>set('ai_model',e.target.value)} />
                <p className="field-hint">مثال: google/gemma-2-9b-it:free</p>
            </div>
            <div className="card">
                <div className="card-head"><span className="card-icon">✍️</span><span className="card-title">امضا</span></div>
                <textarea className="field" rows="2" placeholder="🌋 > @MyChannel" value={form.signature||''} onChange={e=>set('signature',e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={save}>💾 ذخیره</button>
        </div>
    );
}

// ═══ Sources View ═══
function Sources({ show }) {
    const [list, setList] = useState([]);
    const [text, setText] = useState('');
    const load = useCallback(async () => { try { const d = await api('/api/sources'); setList(d.sources||[]); } catch{} }, []);
    useEffect(() => { load(); }, [load]);
    const add = async () => {
        const urls = text.split('\n').map(l=>l.trim()).filter(l=>l.startsWith('https://'));
        if (!urls.length) return show('لینک‌ها باید با https:// شروع بشن','error');
        const d = await api('/api/sources','POST',{urls}); show(`${d.added} منبع اضافه شد`,'success'); setText(''); load();
    };
    const del = async (id) => { await api(`/api/sources/${id}`,'DELETE'); show('حذف شد','success'); load(); };
    return (
        <div className="fade-in">
            <div className="card">
                <div className="card-head"><span className="card-icon">📡</span><span className="card-title">افزودن منابع</span></div>
                <p className="field-hint">هر لینک در یک خط — با https://</p>
                <textarea className="field" rows="5" placeholder="https://feeds.ign.com/ign/all&#10;https://reddit.com/r/gaming&#10;https://mcpedl.com/" value={text} onChange={e=>setText(e.target.value)} />
                <button className="btn btn-ghost" style={{marginTop:'8px'}} onClick={add}>➕ افزودن</button>
            </div>
            <div className="card">
                <div className="card-head"><span className="card-icon">📋</span><span className="card-title">منابع فعلی</span></div>
                {list.length === 0 ? <div className="empty"><div className="empty-icon">📡</div><div className="empty-txt">هیچ منبعی اضافه نشده</div></div> :
                    list.map(s => <div key={s.id} className="src-item"><span className="src-type">{s.source_type}</span><span className="src-url">{s.url}</span><span className="src-del" onClick={()=>del(s.id)}>✕</span></div>)}
            </div>
        </div>
    );
}

// ═══ Posts View ═══
function Posts({ show }) {
    const [tab, setTab] = useState('pending');
    const [posts, setPosts] = useState([]);
    const load = useCallback(async () => {
        try { const d = await api(`/api/posts?status=${tab}`); setPosts(d.posts||[]); } catch{}
    }, [tab]);
    useEffect(() => { load(); }, [load]);
    const approve = async (uid) => { const d = await api(`/api/posts/${uid}/approve`,'POST'); show(d.success?'منتشر شد':'خطا', d.success?'success':'error'); load(); };
    const reject = async (uid) => { const d = await api(`/api/posts/${uid}/reject`,'POST'); show('رد شد','success'); load(); };
    return (
        <div className="fade-in">
            <div className="tab-bar">
                <div className={`tab ${tab==='pending'?'active':''}`} onClick={()=>setTab('pending')}>⏳ در انتظار</div>
                <div className={`tab ${tab==='published'?'active':''}`} onClick={()=>setTab('published')}>✅ منتشرشده</div>
                <div className={`tab ${tab==='scheduled'?'active':''}`} onClick={()=>setTab('scheduled')}>📅 زمان‌بندی</div>
            </div>
            {posts.length === 0 ? <div className="empty"><div className="empty-icon">📋</div><div className="empty-txt">هیچ پستی وجود ندارد</div></div> :
                posts.map(p => (
                    <div key={p.uid} className="post-card">
                        <div className="post-meta"><span className="post-uid">{p.uid}</span><span className="post-score">⭐{p.score?.toFixed(1)}</span></div>
                        <div className="post-caption">{p.caption}</div>
                        {tab==='pending' && <div className="post-actions">
                            <button className="btn btn-sm btn-primary" onClick={()=>approve(p.uid)}>✅ تأیید</button>
                            <button className="btn btn-sm btn-danger" onClick={()=>reject(p.uid)}>❌ رد</button>
                        </div>}
                    </div>
                ))}
        </div>
    );
}

// ═══ Channel Settings View ═══
function ChannelSettings({ settings, onSave, show }) {
    const [form, setForm] = useState(settings);
    useEffect(() => setForm(settings), [settings]);
    const set = (k,v) => setForm(f => ({...f, [k]: v}));
    const rmWM = async () => { await api('/api/watermark','DELETE'); show('واترمارک حذف شد','success'); };
    return (
        <div className="fade-in">
            <div className="card"><div className="card-head"><span className="card-icon">📺</span><span className="card-title">کانال تلگرام</span></div>
                <input type="text" className="field" placeholder="@MyChannel" value={form.channel_id||''} onChange={e=>set('channel_id',e.target.value)} /></div>
            <div className="card toggle-row"><div className="card-head" style={{margin:0}}><span className="card-icon">🔄</span><span className="card-title">اتوپست</span></div>
                <label className="toggle"><input type="checkbox" checked={form.autopost_enabled||false} onChange={e=>set('autopost_enabled',e.target.checked)} /><span className="toggle-slider"></span></label></div>
            <div className="card"><div className="card-head"><span className="card-icon">⏱</span><span className="card-title">فاصله جمع‌آوری</span></div>
                <select className="field" value={form.collection_interval||30} onChange={e=>set('collection_interval',parseInt(e.target.value))}>
                    <option value="5">۵ دقیقه</option><option value="10">۱۰ دقیقه</option><option value="15">۱۵ دقیقه</option>
                    <option value="30">۳۰ دقیقه</option><option value="60">۶۰ دقیقه</option></select></div>
            <div className="card"><div className="card-head"><span className="card-icon">🖼</span><span className="card-title">واترمارک</span></div>
                <p className="field-hint">{form.watermark_path ? '✅ تنظیم شده' : '❌ تنظیم نشده'}</p>
                <p className="field-hint">برای آپلود واترمارک، در چت ربات عکس رو بفرست.</p>
                {form.watermark_path && <button className="btn btn-danger btn-sm" onClick={rmWM} style={{marginTop:'8px'}}>🗑 حذف</button>}</div>
            <button className="btn btn-primary" onClick={()=>onSave(form)}>💾 ذخیره</button>
        </div>
    );
}

// ═══ Rubika View ═══
function RubikaSettings({ settings, onSave }) {
    const [form, setForm] = useState(settings);
    useEffect(() => setForm(settings), [settings]);
    const set = (k,v) => setForm(f => ({...f, [k]: v}));
    return (
        <div className="fade-in">
            <div className="card toggle-row"><div className="card-head" style={{margin:0}}><span className="card-icon">🌐</span><span className="card-title">اتصال به روبیکا</span></div>
                <label className="toggle"><input type="checkbox" checked={form.rubika_enabled||false} onChange={e=>set('rubika_enabled',e.target.checked)} /><span className="toggle-slider"></span></label></div>
            <div className="card"><div className="card-head"><span className="card-icon">🔑</span><span className="card-title">توکن ربات روبیکا</span></div>
                <input type="password" className="field" placeholder="توکن" value={form.rubika_token||''} onChange={e=>set('rubika_token',e.target.value)} /></div>
            <div className="card"><div className="card-head"><span className="card-icon">🆔</span><span className="card-title">آیدی ادمین روبیکا</span></div>
                <input type="text" className="field" placeholder="@username" value={form.rubika_admin_id||''} onChange={e=>set('rubika_admin_id',e.target.value)} /></div>
            <div className="card"><div className="card-head"><span className="card-icon">📺</span><span className="card-title">کانال روبیکا</span></div>
                <input type="text" className="field" placeholder="@channel" value={form.rubika_channel_id||''} onChange={e=>set('rubika_channel_id',e.target.value)} /></div>
            <button className="btn btn-primary" onClick={()=>onSave(form)}>💾 ذخیره</button>
        </div>
    );
}

// ═══ Profile View ═══
function Profile({ data }) {
    return (
        <div className="fade-in">
            <div className="card" style={{textAlign:'center'}}>
                <div style={{fontSize:'40px',marginBottom:'8px'}}>👤</div>
                <h3 style={{fontSize:'16px'}}>{data.full_name || 'کاربر'}</h3>
                <p className="field-hint">{data.is_operator ? 'اوپراتور اصلی' : 'ادمین'}</p>
            </div>
            <div className="card"><div className="card-head"><span className="card-icon">📅</span><span className="card-title">اشتراک</span></div>
                <p style={{fontSize:'13px',color:'var(--text-2)'}}>وضعیت: {data.subscription_active ? '✅ فعال' : '❌ منقضی'}</p>
                {data.subscription_expires && <p className="field-hint">انقضا: {data.subscription_expires}</p>}</div>
            <div className="card"><div className="card-head"><span className="card-icon">📊</span><span className="card-title">آمار</span></div>
                <div className="toggle-row" style={{marginBottom:'6px'}}><span style={{fontSize:'12px',color:'var(--text-3)'}}>پست‌های منتشرشده</span><span style={{fontSize:'12px'}}>{data.published_count||0}</span></div>
                <div className="toggle-row" style={{marginBottom:'6px'}}><span style={{fontSize:'12px',color:'var(--text-3)'}}>منابع فعال</span><span style={{fontSize:'12px'}}>{data.sources_count||0}</span></div>
                <div className="toggle-row"><span style={{fontSize:'12px',color:'var(--text-3)'}}>Provider</span><span style={{fontSize:'12px',color:'var(--accent)'}}>{data.ai_provider||'—'}</span></div></div>
        </div>
    );
}

// ═══ Subscription View ═══
function Subscription({ show }) {
    return (
        <div className="fade-in">
            <div className="sub-card">
                <div className="sub-plan">ماهانه</div>
                <div className="sub-price">۹۰٬۰۰۰ تومان</div>
                <div className="sub-period">در ماه</div>
                <ul className="sub-features">
                    <li>هوش مصنوعی Agentic</li><li>منابع نامحدود (RSS، Reddit، Website)</li>
                    <li>آینه‌ی روبیکا</li><li>واترمارک خودکار</li><li>ماد Modrinth و mcpedl</li>
                    <li>یادگیری از بازخورد</li><li>پشتیبانی اختصاصی</li>
                </ul>
                <a href="https://t.me/NetherAgentBot" className="btn btn-primary">📱 خرید اشتراک</a>
            </div>
        </div>
    );
}

// ═══ Ad Screen ═══
function AdScreen() {
    const feats = [
        {i:'🤖',t:'هوش مصنوعی Agentic',d:'جمع‌آوری خودکار اخبار، تولید پست با AI، انتشار هوشمند'},
        {i:'📡',t:'منابع نامحدود',d:'RSS، Reddit، وبسایت، mcpedl و Modrinth — کاملاً ایزوله'},
        {i:'🌐',t:'آینه‌ی روبیکا',d:'ربات تلگرام شما به‌عنوان آینه‌ی کامل در روبیکا هم کار می‌کنه'},
        {i:'🧠',t:'یادگیری از بازخورد',d:'ربات سلیقه‌ی شما رو یاد می‌گیره و اعمال می‌کنه'},
    ];
    return (
        <div className="fullscreen">
            <div className="ad-logo">🌋</div>
            <div className="ad-name">Nether Agent</div>
            <div className="ad-desc">دستیار هوشمندِ خودکارِ مدیریت کانال</div>
            <div className="ad-features">{feats.map((f,i)=>(
                <div key={i} className="ad-feat"><span className="ad-feat-icon">{f.i}</span><div><h4>{f.t}</h4><p>{f.d}</p></div></div>
            ))}</div>
            <div className="ad-cta"><p className="ad-price">برای دسترسی به این قابلیت‌ها، اشتراک فعال لازمه.</p>
                <a href="https://t.me/NetherAgentBot" className="btn btn-primary">📱 دریافت اشتراک</a></div>
        </div>
    );
}

// ═══ Connection Error ═══
function ConnError({ msg }) {
    return <div className="fullscreen"><div className="ad-logo">⚠️</div><div className="ad-name">خطای اتصال</div>
        <div className="ad-desc">{msg}</div><button className="btn btn-primary" onClick={()=>location.reload()}>🔄 تلاش مجدد</button></div>;
}

// ═══ Loading ═══
function Loading() {
    return <div className="loader"><div className="ring"></div><div className="loader-txt">در حال اتصال...</div></div>;
}

// ═══ Main App ═══
function App() {
    const [view, setView] = useState('loading');
    const [page, setPage] = useState('dashboard');
    const [settings, setSettings] = useState({});
    const [dashData, setDashData] = useState({});
    const { toast, show } = useToast();

    useEffect(() => {
        if (!initData) { setView('ad'); return; }
        if (!API_BASE) { setView('error'); return; }
        (async () => {
            try {
                const d = await api('/api/settings');
                if (d.error) { setView('ad'); return; }
                setSettings(d); setDashData(d); setView('app');
            } catch { setView('error'); }
        })();
    }, []);

    const saveSettings = async (form) => {
        try { await api('/api/settings','POST',form); show('✅ ذخیره شد','success'); setSettings(form); }
        catch { show('❌ خطا','error'); }
    };

    const navItems = [
        {id:'dashboard',label:'داشبورد',icon:<I.dashboard/>},
        {id:'ai',label:'هوش مصنوعی',icon:<I.ai/>},
        {id:'sources',label:'منابع',icon:<I.sources/>},
        {id:'posts',label:'پست‌ها',icon:<I.posts/>},
        {id:'channel',label:'کانال',icon:<I.channel/>},
        {id:'rubika',label:'روبیکا',icon:<I.rubika/>},
        {id:'profile',label:'پروفایل',icon:<I.profile/>},
        {id:'sub',label:'اشتراک',icon:<I.sub/>},
    ];

    if (view === 'loading') return <><BG/><Loading/></>;
    if (view === 'error') return <><BG/><ConnError msg="نتونستم به سرور ربات وصل شم. مطمئن شو ربات روی هاست در حال اجراست."/></>;
    if (view === 'ad') return <><BG/><AdScreen/></>;

    return (
        <div className="app">
            <BG/>
            <header className="topbar">
                <div className="topbar-brand"><span className="topbar-logo">🌋</span><span className="topbar-name">Nether Agent</span></div>
                <div className="topbar-status"><span className={`status-dot ${settings.ai_provider?'on':''}`}></span><span>{settings.is_operator?'اوپراتور':'ادمین'}</span></div>
            </header>
            <main className="content">
                <div className="content-inner">
                    {page==='dashboard' && <Dashboard data={dashData} onNav={setPage} />}
                    {page==='ai' && <AISettings settings={settings} onSave={saveSettings} show={show} />}
                    {page==='sources' && <Sources show={show} />}
                    {page==='posts' && <Posts show={show} />}
                    {page==='channel' && <ChannelSettings settings={settings} onSave={saveSettings} show={show} />}
                    {page==='rubika' && <RubikaSettings settings={settings} onSave={saveSettings} />}
                    {page==='profile' && <Profile data={dashData} />}
                    {page==='sub' && <Subscription show={show} />}
                </div>
            </main>
            <nav className="nav">
                {navItems.map(n => (
                    <button key={n.id} className={`nav-item ${page===n.id?'active':''}`} onClick={()=>{setPage(n.id); if(tg)tg.HapticFeedback.impactOccurred('light');}}>
                        {n.icon}<span>{n.label}</span>
                    </button>
                ))}
            </nav>
            {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
        </div>
    );
}

// ═══ Background ═══
function BG() {
    return <div className="nether-bg">{[0,1,2,3,4,5].map(i=><div key={i} className="particle" style={{left:`${10+i*15}%`,animationDelay:`${i*1.5}s`}}/>)}</div>;
}

// ═══ Render ═══
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
