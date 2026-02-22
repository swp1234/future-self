// Day in Your Future Life - Story Cards

// i18n init
(async function initI18n() {
    try {
        await i18n.init();
        const langToggle = document.getElementById('lang-toggle');
        const langMenu = document.getElementById('lang-menu');
        const langOptions = document.querySelectorAll('.lang-option');
        document.querySelector(`[data-lang="${i18n.getCurrentLanguage()}"]`)?.classList.add('active');
        langToggle?.addEventListener('click', () => langMenu.classList.toggle('hidden'));
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.language-selector')) langMenu?.classList.add('hidden');
        });
        langOptions.forEach(opt => {
            opt.addEventListener('click', async () => {
                await i18n.setLanguage(opt.getAttribute('data-lang'));
                langOptions.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                langMenu.classList.add('hidden');
            });
        });
    } catch (e) {
        console.warn('i18n init failed:', e);
    } finally {
        const loader = document.getElementById('app-loader');
        if (loader) { loader.classList.add('hidden'); setTimeout(() => loader.remove(), 300); }
    }
})();

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    const savedTheme = localStorage.getItem('app-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'light' ? '\u{1F319}' : '\u{2600}\u{FE0F}';
    themeToggle.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('app-theme', next);
        themeToggle.textContent = next === 'light' ? '\u{1F319}' : '\u{2600}\u{FE0F}';
    });
}

// Moment definitions: key, sky class, choice→type mappings
const MOMENTS = [
    { key: 'm1', sky: 'dawn',       choices: [['ceo','inventor'],    ['artist','freelancer'],   ['adventurer','healer']] },
    { key: 'm2', sky: 'morning',    choices: [['ceo','influencer'],  ['freelancer','scholar'],  ['inventor','adventurer']] },
    { key: 'm3', sky: 'midmorning', choices: [['influencer','ceo'],  ['artist','inventor'],     ['healer','scholar']] },
    { key: 'm4', sky: 'noon',       choices: [['influencer','adventurer'], ['freelancer','artist'], ['scholar','inventor']] },
    { key: 'm5', sky: 'afternoon',  choices: [['ceo','influencer'],  ['scholar','healer'],      ['adventurer','freelancer']] },
    { key: 'm6', sky: 'evening',    choices: [['adventurer','ceo'],  ['artist','healer'],       ['influencer','freelancer']] },
    { key: 'm7', sky: 'night',      choices: [['inventor','freelancer'], ['healer','scholar'],  ['artist','influencer']] },
    { key: 'm8', sky: 'latenight',  choices: [['ceo','adventurer'],  ['healer','artist'],       ['scholar','inventor']] }
];

const TYPE_KEYS = ['ceo', 'artist', 'adventurer', 'scholar', 'healer', 'influencer', 'inventor', 'freelancer'];
const TYPE_COLORS = {
    ceo: '#e74c3c', artist: '#9b59b6', adventurer: '#e67e22', scholar: '#3498db',
    healer: '#2ecc71', influencer: '#f39c12', inventor: '#1abc9c', freelancer: '#34495e'
};

// State
let currentMoment = 0;
let typeScores = {};
let isAnimating = false;

// DOM
const screens = {
    intro: document.getElementById('screen-intro'),
    story: document.getElementById('screen-story'),
    result: document.getElementById('screen-result')
};

function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
    window.scrollTo(0, 0);
}

// Reset scores
function resetScores() {
    typeScores = {};
    TYPE_KEYS.forEach(k => typeScores[k] = 0);
}

// Start
document.getElementById('btn-start').addEventListener('click', () => {
    currentMoment = 0;
    resetScores();
    showScreen('story');
    renderMoment();
    if (typeof gtag === 'function') {
        gtag('event', 'test_start', { app_name: 'future-self', content_type: 'story_cards' });
    }
});

function renderMoment() {
    const m = MOMENTS[currentMoment];
    const mk = m.key;

    // Sky background
    const skyBg = document.getElementById('sky-bg');
    skyBg.className = 'sky-bg sky-' + m.sky;

    // Time display
    document.getElementById('time-clock').textContent = i18n.t(`moments.${mk}.time`) || '';
    document.getElementById('time-period').textContent = i18n.t(`moments.${mk}.period`) || '';
    document.getElementById('moment-counter').textContent = `${currentMoment + 1} / ${MOMENTS.length}`;

    // Timeline
    const fillPct = ((currentMoment + 1) / MOMENTS.length) * 100;
    document.getElementById('timeline-fill').style.width = fillPct + '%';
    const dots = document.querySelectorAll('#timeline-dots .tdot');
    dots.forEach((d, i) => {
        d.classList.toggle('active', i <= currentMoment);
        d.classList.toggle('current', i === currentMoment);
    });

    // Story card
    document.getElementById('scene-text').textContent = i18n.t(`moments.${mk}.scene`) || '';
    document.getElementById('prompt-text').textContent = i18n.t(`moments.${mk}.prompt`) || '';

    // Card animation
    const card = document.getElementById('story-card');
    card.classList.remove('card-enter');
    void card.offsetHeight;
    card.classList.add('card-enter');

    // Choice buttons
    const choicesEl = document.getElementById('choices');
    choicesEl.innerHTML = '';
    for (let ci = 0; ci < 3; ci++) {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = i18n.t(`moments.${mk}.c${ci + 1}`) || '';
        btn.addEventListener('click', () => handleChoice(ci));
        choicesEl.appendChild(btn);
    }
}

function handleChoice(choiceIndex) {
    if (isAnimating) return;
    isAnimating = true;

    const m = MOMENTS[currentMoment];
    const types = m.choices[choiceIndex];

    // Visual feedback
    const btns = document.querySelectorAll('.choice-btn');
    btns[choiceIndex]?.classList.add('pressed');

    // Score
    types.forEach(t => typeScores[t]++);

    setTimeout(() => {
        isAnimating = false;
        currentMoment++;
        if (currentMoment < MOMENTS.length) {
            renderMoment();
        } else {
            showResult();
        }
    }, 350);
}

function showResult() {
    // Find winner type
    let maxScore = 0;
    let winner = 'freelancer';
    for (const [type, score] of Object.entries(typeScores)) {
        if (score > maxScore) {
            maxScore = score;
            winner = type;
        }
    }

    const typeData = i18n.t(`types.${winner}`) || {};

    // Reset sky
    document.getElementById('sky-bg').className = 'sky-bg';

    // Emoji
    const emojiMap = { ceo: '\u{1F454}', artist: '\u{1F3A8}', adventurer: '\u{1F9D7}', scholar: '\u{1F4DA}', healer: '\u{1F49A}', influencer: '\u2B50', inventor: '\u{1F52C}', freelancer: '\u{1F30A}' };
    document.getElementById('result-emoji').textContent = emojiMap[winner] || '\u{1F680}';

    // Type info
    document.getElementById('result-name').textContent = typeData.name || winner;
    document.getElementById('result-desc').textContent = typeData.desc || '';

    // Traits
    const traitsList = document.getElementById('result-traits');
    traitsList.innerHTML = (typeData.traits || []).map(t => `<li>${t}</li>`).join('');

    // Advice
    document.getElementById('result-advice').textContent = typeData.advice || '';

    // Quote
    document.getElementById('result-quote').textContent = typeData.quote || '';

    // Compatible
    document.getElementById('result-compatible').textContent = (typeData.compatible || []).join(' & ');

    showScreen('result');

    if (typeof gtag === 'function') {
        gtag('event', 'test_complete', {
            app_name: 'future-self',
            event_category: 'future_self',
            result_type: winner,
            result_value: maxScore
        });
    }
}

// Share
document.getElementById('btn-twitter')?.addEventListener('click', () => {
    let maxScore = 0;
    let winner = 'freelancer';
    for (const [type, score] of Object.entries(typeScores)) {
        if (score > maxScore) { maxScore = score; winner = type; }
    }
    const typeName = i18n.t(`types.${winner}.name`) || winner;
    let text = i18n.t('share.twitterText') || 'My future path: {type}!';
    text = text.replace('{type}', typeName);
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent('https://dopabrain.com/future-self/')}`;
    window.open(url, '_blank');
    if (typeof gtag === 'function') gtag('event', 'share', { method: 'twitter', app_name: 'future-self' });
});

document.getElementById('btn-copy')?.addEventListener('click', () => {
    navigator.clipboard.writeText('https://dopabrain.com/future-self/').then(() => {
        const btn = document.getElementById('btn-copy');
        const orig = btn.textContent;
        btn.textContent = i18n.t('share.copied') || 'Copied!';
        setTimeout(() => { btn.textContent = orig; }, 2000);
    });
    if (typeof gtag === 'function') gtag('event', 'share', { method: 'clipboard', app_name: 'future-self' });
});

// Retake
document.getElementById('btn-retake')?.addEventListener('click', () => {
    showScreen('intro');
});
