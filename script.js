import { GoogleGenAI } from "https://esm.sh/@google/genai@^1.39.0";

// --- Configuration & Constants ---
const API_KEY = ""; // Note: Real apps get this from process.env.API_KEY or safe backend
const ALADHAN_API = 'https://api.aladhan.com/v1';
const QURAN_API = 'https://api.alquran.cloud/v1';

const PRAYER_NAMES = {
    Fajr: 'الفجر',
    Sunrise: 'الشروق',
    Dhuhr: 'الظهر',
    Asr: 'العصر',
    Maghrib: 'المغرب (الإفطار)',
    Isha: 'العشاء',
    Imsak: 'الإمساك'
};

const DUA_DATA = {
    "categories": [
        {
            "id": "ramadan",
            "name_ar": "أدعية رمضان",
            "items": [
                {"id":"r1","title":"عند رؤية الهلال","text":"اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْأَمْنِ وَالْإِيمَانِ، وَالسَّلَامَةِ وَالْإِسْلَامِ، رَبِّي وَرَبُّكَ اللَّهُ، هِلَالُ رُشْدٍ وَخَيْرٍ."},
                {"id":"r2","title":"عند الإفطار","text":"ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ، وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ."},
                {"id":"r4","title":"في ليلة القدر","text":"اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي."},
                {"id":"r5","title":"دعاء نية الصيام","text":"اللهمَّ إني نويت أن أصوم رمضان كاملاً لوجهك الكريم إيماناً واحتساباً، اللهمَّ فتقبله مني واغفر لي فيه وبارك لي فيه وزدني علماً."}
            ]
        },
        {
            "id": "morning",
            "name_ar": "أذكار الصباح",
            "items": [
                {"id":"m1","title":"سيد الاستغفار","text":"اللَّهُمَّ أَنْتَ رَبِّي لا إِلَهَ إِلا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لا يَغْفِرُ الذُّنُوبَ إِلا أَنْتَ."}
            ]
        }
    ]
};

const RECITERS = [
    { "id": "hazza", "name_ar": "هزاع البلوشي", "base_url": "https://everyayah.com/data/Hazza_Al_Blushi_128kbps" },
    { "id": "islam", "name_ar": "إسلام صبحي", "base_url": "https://everyayah.com/data/Islam_Sobhi_128kbps" }
];

// --- State ---
let settings = JSON.parse(localStorage.getItem('ramadan_settings')) || {
    city: 'Riyadh',
    country: 'Saudi Arabia',
    method: 4,
    theme: 'dark',
    fontSize: 'md',
    quranReciter: 'hazza',
    favorites: []
};

let currentPage = 'home';
let prayerData = null;
let currentSurah = null;
let isAudioPlaying = false;
let audioPlayer = new Audio();

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initNav();
    navigateTo('home');
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Mobile Menu
    document.getElementById('menu-toggle').onclick = () => document.getElementById('mobile-menu').classList.remove('hidden');
    document.getElementById('menu-close').onclick = () => document.getElementById('mobile-menu').classList.add('hidden');
});

function initNav() {
    const navLinks = [
        { id: 'home', label: 'الرئيسية', icon: 'moon' },
        { id: 'quran', label: 'المصحف', icon: 'book-open' },
        { id: 'dua', label: 'الأدعية', icon: <i data-lucide="heart"></i> && 'heart' },
        { id: 'ai-chat', label: 'المساعد', icon: 'message-circle' },
        { id: 'live', label: 'صوت مباشر', icon: 'mic' },
        { id: 'settings', label: 'الإعدادات', icon: 'settings' }
    ];

    const desktopNav = document.getElementById('desktop-nav');
    const mobileNav = document.getElementById('mobile-nav-links');

    navLinks.forEach(link => {
        const desktopBtn = document.createElement('button');
        desktopBtn.className = `flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium hover:bg-white/5 nav-item-${link.id}`;
        desktopBtn.innerHTML = `<i data-lucide="${link.icon}" class="w-4 h-4"></i><span>${link.label}</span>`;
        desktopBtn.onclick = () => navigateTo(link.id);
        desktopNav.appendChild(desktopBtn);

        const mobileBtn = document.createElement('button');
        mobileBtn.className = `flex items-center gap-4 p-4 rounded-2xl transition-colors text-lg nav-item-mob-${link.id}`;
        mobileBtn.innerHTML = `<i data-lucide="${link.icon}" class="w-6 h-6"></i><span>${link.label}</span>`;
        mobileBtn.onclick = () => { navigateTo(link.id); document.getElementById('mobile-menu').classList.add('hidden'); };
        mobileNav.appendChild(mobileBtn);
    });
    lucide.createIcons();
}

// --- Routing ---
window.navigateTo = function(page) {
    currentPage = page;
    updateNavUI();
    renderPage();
};

function updateNavUI() {
    document.querySelectorAll('[class*="nav-item-"]').forEach(el => el.classList.remove('bg-[#d4af37]/20', 'text-[#d4af37]'));
    const activeDesktop = document.querySelector(`.nav-item-${currentPage}`);
    if (activeDesktop) activeDesktop.classList.add('bg-[#d4af37]/20', 'text-[#d4af37]');
}

async function renderPage() {
    const container = document.getElementById('app-container');
    container.innerHTML = `<div class="flex items-center justify-center h-64"><i data-lucide="loader-2" class="animate-spin text-[#d4af37] w-12 h-12"></i></div>`;
    lucide.createIcons();

    let html = '';
    switch(currentPage) {
        case 'home': html = await getHomeHTML(); break;
        case 'quran': html = await getQuranHTML(); break;
        case 'dua': html = await getDuaHTML(); break;
        case 'ai-chat': html = getAIChatHTML(); break;
        case 'live': html = getLiveSessionHTML(); break;
        case 'settings': html = getSettingsHTML(); break;
    }
    
    container.innerHTML = `<div class="page-fade-in">${html}</div>`;
    lucide.createIcons();
    attachPageListeners();
}

// --- Page Builders ---

async function getHomeHTML() {
    if (!prayerData) {
        try {
            const res = await fetch(`${ALADHAN_API}/timingsByCity?city=${settings.city}&country=${settings.country}&method=${settings.method}`);
            const json = await res.json();
            prayerData = json.data;
        } catch (e) { return `<div class="text-red-500 text-center p-12">فشل تحميل المواقيت</div>`; }
    }

    const timings = prayerData.timings;
    const isRamadan = prayerData.date.hijri.month.number === 9;
    
    return `
        <div class="space-y-8">
            <div class="relative h-64 md:h-80 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                <img src="https://images.unsplash.com/photo-1542662565-7e4b66bae529?auto=format&fit=crop&q=80&w=1200" class="w-full h-full object-cover opacity-60">
                <div class="absolute inset-0 bg-gradient-to-t from-[#050a18] to-transparent"></div>
                <div class="absolute bottom-8 right-8 text-right">
                    <h2 class="text-4xl md:text-6xl font-amiri font-bold text-white">${isRamadan ? 'رمضان مبارك' : 'مواقيت الصلاة'}</h2>
                    <p class="text-[#d4af37] text-xl mt-2">${prayerData.date.hijri.day} ${prayerData.date.hijri.month.ar} ${prayerData.date.hijri.year} هـ</p>
                </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                ${Object.entries(PRAYER_NAMES).map(([key, name]) => `
                    <div class="glass p-5 rounded-3xl text-center border-white/10 hover:border-[#d4af37]/50 transition-all">
                        <div class="text-gray-400 text-xs mb-2">${name}</div>
                        <div class="text-xl md:text-2xl font-bold font-mono ${key === 'Maghrib' ? 'text-[#d4af37]' : 'text-white'}">${timings[key]}</div>
                    </div>
                `).join('')}
            </div>

            <div class="glass p-8 rounded-[2.5rem] text-center border-[#d4af37]/20">
                <h3 class="text-2xl font-amiri font-bold text-[#d4af37] mb-4">قريباً في رمضان</h3>
                <p class="text-gray-400">تابع مواعيد الإمساك والإفطار بدقة مع مساعدنا الذكي.</p>
            </div>
        </div>
    `;
}

async function getQuranHTML() {
    const res = await fetch(`${QURAN_API}/surah`);
    const json = await res.json();
    const surahs = json.data;

    return `
        <div class="space-y-6">
            <h2 class="text-3xl font-amiri font-bold text-[#d4af37]">المصحف الشريف</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                ${surahs.map(s => `
                    <div onclick="loadSurah(${s.number})" class="glass p-6 rounded-3xl flex items-center justify-between cursor-pointer hover:border-[#d4af37]/50 transition-all">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 bg-[#d4af37]/10 rounded-xl flex items-center justify-center text-[#d4af37] font-bold">${s.number}</div>
                            <div>
                                <div class="text-lg font-bold text-white">${s.name}</div>
                                <div class="text-xs text-gray-500">${s.numberOfAyahs} آية</div>
                            </div>
                        </div>
                        <i data-lucide="book-open" class="text-gray-600 w-5 h-5"></i>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

async function getDuaHTML() {
    return `
        <div class="space-y-8">
            <h2 class="text-3xl font-amiri font-bold text-[#d4af37] text-center">الأدعية والأذكار</h2>
            <div class="flex gap-2 overflow-x-auto no-scrollbar pb-2" id="dua-cats">
                <button onclick="filterDua('all')" class="px-4 py-2 bg-[#d4af37]/20 text-[#d4af37] rounded-xl text-sm font-bold">الكل</button>
                ${DUA_DATA.categories.map(c => `
                    <button onclick="filterDua('${c.id}')" class="px-4 py-2 bg-white/5 text-gray-400 rounded-xl text-sm whitespace-nowrap">${c.name_ar}</button>
                `).join('')}
            </div>
            <div class="space-y-4" id="dua-list">
                ${renderDuaList('all')}
            </div>
        </div>
    `;
}

function renderDuaList(catId) {
    let items = [];
    if (catId === 'all') {
        DUA_DATA.categories.forEach(c => items.push(...c.items));
    } else {
        items = DUA_DATA.categories.find(c => c.id === catId)?.items || [];
    }
    
    return items.map(item => `
        <div class="glass p-6 md:p-8 rounded-[2rem] border-white/10 space-y-4">
            <div class="flex justify-between items-start">
                <h3 class="text-xl font-bold font-amiri text-[#d4af37]">${item.title}</h3>
                <button onclick="copyText('${item.text}')" class="p-2 text-gray-500 hover:text-white"><i data-lucide="copy" class="w-5 h-5"></i></button>
            </div>
            <p class="dua-text text-xl md:text-2xl text-right text-white/90">${item.text}</p>
        </div>
    `).join('');
}

function getAIChatHTML() {
    return `
        <div class="max-w-4xl mx-auto flex flex-col h-[70vh]">
            <div class="flex items-center gap-3 mb-4">
                <div class="p-3 bg-[#d4af37]/20 rounded-2xl text-[#d4af37]"><i data-lucide="message-circle"></i></div>
                <h2 class="text-2xl font-bold">المساعد الرمضاني</h2>
            </div>
            <div class="flex-1 glass rounded-3xl overflow-hidden flex flex-col border-white/10">
                <div id="chat-box" class="flex-1 p-6 overflow-y-auto space-y-4">
                    <div class="flex justify-end"><div class="bg-[#d4af37]/10 p-4 rounded-2xl rounded-tl-none max-w-[80%]">أهلاً بك، اسألني عن أي شيء يخص رمضان والدين.</div></div>
                </div>
                <div class="p-4 border-t border-white/10 flex gap-2">
                    <input id="chat-input" type="text" placeholder="اكتب سؤالك هنا..." class="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-[#d4af37]">
                    <button onclick="sendChatMessage()" class="w-12 h-12 bg-[#d4af37] rounded-2xl flex items-center justify-center text-[#050a18]"><i data-lucide="send" class="w-5 h-5"></i></button>
                </div>
            </div>
        </div>
    `;
}

function getLiveSessionHTML() {
    return `
        <div class="max-w-xl mx-auto text-center space-y-8 py-12">
            <div class="p-8 bg-[#d4af37]/10 rounded-[3rem] inline-block text-[#d4af37] relative">
                <i data-lucide="mic" class="w-12 h-12"></i>
                <div id="live-indicator" class="absolute inset-0 rounded-[3rem] border-2 border-[#d4af37] hidden animate-ping opacity-30"></div>
            </div>
            <h2 class="text-3xl font-bold">المحادثة الصوتية المباشرة</h2>
            <div class="glass p-12 rounded-[3rem] border-white/10">
                <button id="live-btn" onclick="toggleLiveSession()" class="w-24 h-24 bg-[#d4af37] rounded-full flex items-center justify-center text-[#050a18] shadow-2xl mx-auto">
                    <i data-lucide="play" class="w-8 h-8 fill-current"></i>
                </button>
                <p id="live-status" class="mt-6 text-gray-400 font-bold">اضغط للبدء بالتحدث</p>
                <div id="live-transcript" class="mt-6 p-4 bg-black/20 rounded-2xl text-sm italic text-gray-500 hidden"></div>
            </div>
        </div>
    `;
}

function getSettingsHTML() {
    return `
        <div class="max-w-2xl mx-auto space-y-8">
            <h2 class="text-3xl font-bold text-center text-[#d4af37]">الإعدادات</h2>
            <div class="glass p-8 rounded-3xl border-white/10 space-y-6">
                <div>
                    <label class="block text-gray-400 text-sm mb-2">المدينة</label>
                    <input type="text" id="set-city" value="${settings.city}" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#d4af37]">
                </div>
                <div>
                    <label class="block text-gray-400 text-sm mb-2">الدولة</label>
                    <input type="text" id="set-country" value="${settings.country}" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#d4af37]">
                </div>
                <button onclick="saveSettings()" class="w-full bg-[#d4af37] text-[#050a18] py-4 rounded-2xl font-bold shadow-xl">حفظ التغييرات</button>
            </div>
        </div>
    `;
}

// --- Logic Functions ---

window.filterDua = function(catId) {
    document.getElementById('dua-list').innerHTML = renderDuaList(catId);
    lucide.createIcons();
};

window.copyText = function(text) {
    navigator.clipboard.writeText(text);
    alert('تم النسخ');
};

window.saveSettings = function() {
    settings.city = document.getElementById('set-city').value;
    settings.country = document.getElementById('set-country').value;
    localStorage.setItem('ramadan_settings', JSON.stringify(settings));
    prayerData = null; // force reload
    alert('تم الحفظ');
    navigateTo('home');
};

window.loadSurah = async function(num) {
    const container = document.getElementById('app-container');
    container.innerHTML = `<div class="flex items-center justify-center h-64"><i data-lucide="loader-2" class="animate-spin text-[#d4af37] w-12 h-12"></i></div>`;
    lucide.createIcons();

    const res = await fetch(`${QURAN_API}/surah/${num}/quran-uthmani`);
    const json = await res.json();
    const s = json.data;

    container.innerHTML = `
        <div class="space-y-6">
            <div class="flex items-center justify-between glass p-4 rounded-2xl">
                <button onclick="navigateTo('quran')" class="text-gray-400"><i data-lucide="arrow-right"></i></button>
                <h2 class="text-2xl font-bold font-amiri text-[#d4af37]">${s.name}</h2>
                <div class="w-6"></div>
            </div>
            <div class="glass p-8 md:p-16 rounded-[2.5rem] paper-mode font-amiri text-3xl leading-[2.5] text-center">
                ${s.ayahs.map(a => `<span class="hover:bg-[#d4af37]/20 px-1 rounded-lg cursor-pointer">${a.text} <span class="text-sm font-sans opacity-50 border rounded-full px-2">${a.numberInSurah}</span></span>`).join(' ')}
            </div>
        </div>
    `;
    lucide.createIcons();
};

// --- AI & Live Session Logic ---

window.sendChatMessage = async function() {
    const input = document.getElementById('chat-input');
    const box = document.getElementById('chat-box');
    const msg = input.value.trim();
    if (!msg) return;

    input.value = '';
    box.innerHTML += `<div class="flex justify-start"><div class="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tr-none max-w-[80%]">${msg}</div></div>`;
    box.scrollTop = box.scrollHeight;

    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: msg,
            config: { systemInstruction: "أنت عالم إسلامي رقمي تجيب على أسئلة المستخدمين بدقة ولطف." }
        });
        box.innerHTML += `<div class="flex justify-end"><div class="bg-[#d4af37]/10 p-4 rounded-2xl rounded-tl-none max-w-[80%]">${response.text}</div></div>`;
    } catch (e) {
        box.innerHTML += `<div class="flex justify-end text-red-500">حدث خطأ في الاتصال</div>`;
    }
    box.scrollTop = box.scrollHeight;
    lucide.createIcons();
};

let liveActive = false;
window.toggleLiveSession = async function() {
    const btn = document.getElementById('live-btn');
    const status = document.getElementById('live-status');
    const indicator = document.getElementById('live-indicator');
    
    if (liveActive) {
        location.reload(); // Simplest way to kill session/audio/mic in vanilla
        return;
    }

    try {
        liveActive = true;
        btn.innerHTML = `<i data-lucide="square" class="w-8 h-8 fill-current"></i>`;
        status.textContent = 'جاري التحدث...';
        indicator.classList.remove('hidden');
        lucide.createIcons();
        
        // This is a placeholder for the Live API handshake
        // In a real implementation, you'd setup AudioContext and connect via GoogleGenAI.live.connect
        console.log("Starting Live Session with Gemini 2.5 Native Audio...");
        
    } catch (e) {
        alert("يرجى تفعيل الميكروفون وتثبيت مفتاح API صحيح");
        location.reload();
    }
};

function attachPageListeners() {} // For future expandability