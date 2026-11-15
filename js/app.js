// Day in Your Future Life - Story Cards

const ENTRY_QUERY = new URLSearchParams(window.location.search);
const rawEntrySource = ENTRY_QUERY.get('source') || '';
const ENTRY_SOURCE = /^[a-z0-9_-]{1,48}$/.test(rawEntrySource) ? rawEntrySource : 'direct';

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
        function syncCuratedResourceLinks(lang) {
            const current = lang || (typeof i18n !== 'undefined' ? i18n.getCurrentLanguage() : 'en');
            const amzDomains = {
                en: 'www.amazon.com',
                ja: 'www.amazon.co.jp',
                es: 'www.amazon.es',
                fr: 'www.amazon.fr',
                de: 'www.amazon.de',
                pt: 'www.amazon.com.br'
            };
            const tag = 'dopabrain-' + '20';
            document.querySelectorAll('.curated-resource-item').forEach(link => {
                const asin = link.getAttribute('data-asin');
                const koQuery = link.getAttribute('data-ko-query');
                if (current === 'ko' && koQuery) {
                    link.href = 'https://search.kyobobook.co.kr/search?keyword=' + encodeURIComponent(koQuery);
                } else if (asin) {
                    const domain = amzDomains[current] || 'www.amazon.com';
                    link.href = 'https://' + domain + '/dp/' + asin + '?tag=' + tag;
                }
            });
        }
        function updateNextAppLinks(lang) {
            const current = lang || (typeof i18n !== 'undefined' ? i18n.getCurrentLanguage() : 'ko');
            document.querySelectorAll('.next-app-link, .related-link').forEach(link => {
                const base = link.getAttribute('data-base-href');
                if (!base) return;
                const hasStart = link.getAttribute('data-start') === '1';
                const source = link.classList.contains('related-link') ? 'future_self_footer' : 'future_self_result';
                link.href = `${base}?lang=${encodeURIComponent(current)}${hasStart ? '&start=1' : ''}&source=${source}`;
            });
            syncCuratedResourceLinks(current);
        }
        updateNextAppLinks(i18n.getCurrentLanguage());
        langOptions.forEach(opt => {
            opt.addEventListener('click', async () => {
                const selected = opt.getAttribute('data-lang');
                await i18n.setLanguage(selected);
                updateNextAppLinks(selected);
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
        if (ENTRY_QUERY.get('start') === '1') startJourney('linked');
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
let completionSent = false;

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

function startJourney(entryMode) {
    if (screens.story.classList.contains('active')) return;
    currentMoment = 0;
    completionSent = false;
    resetScores();
    showScreen('story');
    renderMoment();
    if (typeof gtag === 'function') {
        gtag('event', 'test_start', {
            app_name: 'future-self',
            content_type: 'story_cards',
            entry_mode: entryMode,
            source_surface: ENTRY_SOURCE
        });
    }
}

// Start
document.getElementById('btn-start').addEventListener('click', () => startJourney('manual'));

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
    document.getElementById('result-desc').textContent = i18n.t('result.boundary') || '';

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

    if (!completionSent && typeof gtag === 'function') {
        completionSent = true;
        gtag('event', 'test_complete', {
            app_name: 'future-self',
            event_category: 'future_self',
            question_count: MOMENTS.length,
            scoring_method: 'fixed_dual_path_points'
        });
    }
}

function drawRoundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = String(text || '').split(' ');
    let line = '';
    let currentY = y;
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line.trim(), x, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line.trim(), x, currentY);
}

function generateStoryCardCanvas() {
    let maxScore = 0;
    let winner = 'freelancer';
    for (const [type, score] of Object.entries(typeScores)) {
        if (score > maxScore) { maxScore = score; winner = type; }
    }
    const typeData = i18n.t(`types.${winner}`) || {};
    const typeName = typeData.name || winner;
    const emojiMap = { ceo: '\u{1F454}', artist: '\u{1F3A8}', adventurer: '\u{1F9D7}', scholar: '\u{1F4DA}', healer: '\u{1F49A}', influencer: '\u2B50', inventor: '\u{1F52C}', freelancer: '\u{1F30A}' };
    const emoji = emojiMap[winner] || '\u{1F680}';
    const traits = (typeData.traits || []).slice(0, 3);
    const quote = typeData.quote || '';

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
    bgGrad.addColorStop(0, '#0a0d18');
    bgGrad.addColorStop(0.4, '#13122c');
    bgGrad.addColorStop(1, '#070a12');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    const themeColor = TYPE_COLORS[winner] || '#8b5cf6';
    const glow = ctx.createRadialGradient(540, 620, 60, 540, 620, 480);
    glow.addColorStop(0, themeColor + '55');
    glow.addColorStop(0.6, themeColor + '18');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(60, 140, 960, 960);

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 3;
    drawRoundRect(ctx, 50, 50, 980, 1820, 36);
    ctx.stroke();
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.font = '600 28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText('DOPABRAIN  \u2022  2035 ARCHETYPE', 540, 160);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 44px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText('MY FUTURE SELF JOURNEY', 540, 230);

    ctx.save();
    ctx.beginPath();
    ctx.arc(540, 500, 140, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = themeColor;
    ctx.stroke();

    ctx.font = '130px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 540, 505);
    ctx.restore();

    ctx.fillStyle = themeColor;
    ctx.font = '800 64px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText(typeName, 540, 740);

    const startY = 840;
    traits.forEach((t, i) => {
        const y = startY + (i * 96);
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.lineWidth = 2;
        drawRoundRect(ctx, 150, y, 780, 72, 20);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = '600 32px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillText('\u2728 ' + t, 540, y + 46);
        ctx.restore();
    });

    if (quote) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.strokeStyle = themeColor + '66';
        ctx.lineWidth = 2;
        drawRoundRect(ctx, 130, 1180, 820, 250, 24);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'italic 500 32px -apple-system, BlinkMacSystemFont, serif';
        wrapCanvasText(ctx, '\u201C' + quote + '\u201D', 540, 1270, 740, 48);
        ctx.restore();
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '500 28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText('Discover your future persona at', 540, 1680);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 38px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText('dopabrain.com/future-self', 540, 1740);

    return canvas;
}

// Story Card Share
document.getElementById('btn-story-card')?.addEventListener('click', () => {
    const btn = document.getElementById('btn-story-card');
    const orig = btn.textContent;
    btn.textContent = '\u23F3 Rendering...';
    btn.disabled = true;

    try {
        const canvas = generateStoryCardCanvas();
        if (!canvas) throw new Error('Canvas rendering failed');

        canvas.toBlob(async (blob) => {
            if (!blob) throw new Error('Blob conversion failed');
            const file = new File([blob], 'future-self-2035.png', { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'My 2035 Future Self',
                        text: 'Discover your 2035 archetype on DopaBrain: https://dopabrain.com/future-self/'
                    });
                    if (typeof gtag === 'function') gtag('event', 'share', { method: 'story_card_native', app_name: 'future-self' });
                    btn.textContent = '\u2713 Shared!';
                    setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 2500);
                    return;
                } catch (shareErr) {
                    if (shareErr.name === 'AbortError') {
                        btn.textContent = orig;
                        btn.disabled = false;
                        return;
                    }
                }
            }

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'future-self-2035.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 10000);

            if (typeof gtag === 'function') gtag('event', 'share', { method: 'story_card_download', app_name: 'future-self' });
            btn.textContent = '\u2713 Saved to Photos!';
            setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 2500);
        }, 'image/png');
    } catch (err) {
        console.warn('Story card error:', err);
        btn.textContent = orig;
        btn.disabled = false;
    }
});

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
    const shareWindow = window.open(url, '_blank', 'noopener');
    if (shareWindow && typeof gtag === 'function') gtag('event', 'share', { method: 'twitter', app_name: 'future-self' });
});

document.getElementById('btn-copy')?.addEventListener('click', () => {
    navigator.clipboard.writeText('https://dopabrain.com/future-self/').then(() => {
        const btn = document.getElementById('btn-copy');
        const orig = btn.textContent;
        btn.textContent = i18n.t('share.copied') || 'Copied!';
        setTimeout(() => { btn.textContent = orig; }, 2000);
        if (typeof gtag === 'function') gtag('event', 'share', { method: 'clipboard', app_name: 'future-self' });
    });
});

// Retake
document.getElementById('btn-retake')?.addEventListener('click', () => {
    showScreen('intro');
});

// CTA Conversion tracking
document.querySelectorAll('.next-app-link, .related-link, .curated-resource-item').forEach(link => {
    link.addEventListener('click', () => {
        if (typeof gtag !== 'function') return;
        const lang = (typeof i18n !== 'undefined' ? i18n.getCurrentLanguage() : 'en');
        if (link.classList.contains('curated-resource-item')) {
            const resourceId = link.getAttribute('data-resource-id') || 'unknown';
            gtag('event', 'curated_resource_click', {
                event_category: 'monetization',
                app_name: 'future-self',
                resource_id: resourceId,
                content_locale: lang,
                target_url: link.href
            });
            gtag('event', 'content_cta_click', {
                event_category: 'engagement',
                page_path: location.pathname,
                target_url: link.href,
                link_id: 'future_self_curated_' + resourceId
            });
            return;
        }
        gtag('event', 'content_cta_click', {
            event_category: 'engagement',
            page_path: location.pathname,
            target_url: link.href,
            link_id: link.classList.contains('next-app-link') ? 'future_self_next_app' : 'future_self_related'
        });
    });
});

