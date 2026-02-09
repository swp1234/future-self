/**
 * Future Self Quiz Data
 * Questions and result types
 */

const FUTURE_TYPES = {
    ceo: {
        id: 'ceo',
        emoji: '👔',
        nameKey: 'result.types.ceo',
        descriptionKey: 'result.descriptions.ceo',
        characteristicsKey: 'result.characteristics.ceo',
        adviceKey: 'result.advice.ceo',
        wisdomKey: 'result.wisdom.ceo',
        color: '#e74c3c',
        avatar: drawCeoAvatar
    },
    artist: {
        id: 'artist',
        emoji: '🎨',
        nameKey: 'result.types.artist',
        descriptionKey: 'result.descriptions.artist',
        characteristicsKey: 'result.characteristics.artist',
        adviceKey: 'result.advice.artist',
        wisdomKey: 'result.wisdom.artist',
        color: '#9b59b6',
        avatar: drawArtistAvatar
    },
    adventurer: {
        id: 'adventurer',
        emoji: '🧗',
        nameKey: 'result.types.adventurer',
        descriptionKey: 'result.descriptions.adventurer',
        characteristicsKey: 'result.characteristics.adventurer',
        adviceKey: 'result.advice.adventurer',
        wisdomKey: 'result.wisdom.adventurer',
        color: '#e67e22',
        avatar: drawAdventurerAvatar
    },
    scholar: {
        id: 'scholar',
        emoji: '📚',
        nameKey: 'result.types.scholar',
        descriptionKey: 'result.descriptions.scholar',
        characteristicsKey: 'result.characteristics.scholar',
        adviceKey: 'result.advice.scholar',
        wisdomKey: 'result.wisdom.scholar',
        color: '#3498db',
        avatar: drawScholarAvatar
    },
    healer: {
        id: 'healer',
        emoji: '💚',
        nameKey: 'result.types.healer',
        descriptionKey: 'result.descriptions.healer',
        characteristicsKey: 'result.characteristics.healer',
        adviceKey: 'result.advice.healer',
        wisdomKey: 'result.wisdom.healer',
        color: '#2ecc71',
        avatar: drawHealerAvatar
    },
    influencer: {
        id: 'influencer',
        emoji: '⭐',
        nameKey: 'result.types.influencer',
        descriptionKey: 'result.descriptions.influencer',
        characteristicsKey: 'result.characteristics.influencer',
        adviceKey: 'result.advice.influencer',
        wisdomKey: 'result.wisdom.influencer',
        color: '#f39c12',
        avatar: drawInfluencerAvatar
    },
    inventor: {
        id: 'inventor',
        emoji: '🔬',
        nameKey: 'result.types.inventor',
        descriptionKey: 'result.descriptions.inventor',
        characteristicsKey: 'result.characteristics.inventor',
        adviceKey: 'result.advice.inventor',
        wisdomKey: 'result.wisdom.inventor',
        color: '#1abc9c',
        avatar: drawInventorAvatar
    },
    freelancer: {
        id: 'freelancer',
        emoji: '🌊',
        nameKey: 'result.types.freelancer',
        descriptionKey: 'result.descriptions.freelancer',
        characteristicsKey: 'result.characteristics.freelancer',
        adviceKey: 'result.advice.freelancer',
        wisdomKey: 'result.wisdom.freelancer',
        color: '#34495e',
        avatar: drawFreelancerAvatar
    }
};

// Avatar drawing functions
function drawCeoAvatar(svg) {
    svg.innerHTML = `
        <circle cx="100" cy="100" r="80" fill="#e74c3c" opacity="0.2"/>
        <circle cx="100" cy="70" r="30" fill="#f4a460"/>
        <rect x="70" y="100" width="60" height="50" rx="5" fill="#1c1c1c"/>
        <rect x="75" y="105" width="50" height="12" fill="#e74c3c"/>
        <circle cx="80" cy="85" r="6" fill="#1c1c1c"/>
        <circle cx="120" cy="85" r="6" fill="#1c1c1c"/>
        <ellipse cx="100" cy="120" rx="12" ry="8" fill="#f4a460"/>
    `;
}

function drawArtistAvatar(svg) {
    svg.innerHTML = `
        <circle cx="100" cy="100" r="80" fill="#9b59b6" opacity="0.2"/>
        <circle cx="100" cy="70" r="30" fill="#f4a460"/>
        <path d="M 50 100 Q 50 140 100 150 Q 150 140 150 100 Z" fill="#9b59b6" opacity="0.8"/>
        <circle cx="70" cy="110" r="8" fill="#f39c12"/>
        <circle cx="100" cy="125" r="8" fill="#e74c3c"/>
        <circle cx="130" cy="110" r="8" fill="#3498db"/>
        <circle cx="85" cy="80" r="5" fill="#1c1c1c"/>
        <circle cx="115" cy="80" r="5" fill="#1c1c1c"/>
    `;
}

function drawAdventurerAvatar(svg) {
    svg.innerHTML = `
        <circle cx="100" cy="100" r="80" fill="#e67e22" opacity="0.2"/>
        <circle cx="100" cy="70" r="30" fill="#f4a460"/>
        <path d="M 60 90 L 100 50 L 140 90 Z" fill="#e67e22"/>
        <rect x="70" y="100" width="60" height="40" fill="#8b4513"/>
        <circle cx="75" cy="115" r="5" fill="#f39c12"/>
        <circle cx="125" cy="115" r="5" fill="#f39c12"/>
        <path d="M 90 135 L 95 155 M 110 135 L 105 155" stroke="#8b4513" stroke-width="3" fill="none"/>
    `;
}

function drawScholarAvatar(svg) {
    svg.innerHTML = `
        <circle cx="100" cy="100" r="80" fill="#3498db" opacity="0.2"/>
        <circle cx="100" cy="70" r="30" fill="#f4a460"/>
        <polygon points="100,50 75,75 100,90 125,75" fill="#3498db"/>
        <rect x="70" y="100" width="60" height="45" fill="#34495e" opacity="0.8"/>
        <line x1="75" y1="107" x2="125" y2="107" stroke="#ecf0f1" stroke-width="2"/>
        <line x1="75" y1="118" x2="125" y2="118" stroke="#ecf0f1" stroke-width="2"/>
        <line x1="75" y1="129" x2="120" y2="129" stroke="#ecf0f1" stroke-width="2"/>
        <circle cx="80" cy="85" r="5" fill="#1c1c1c"/>
        <circle cx="120" cy="85" r="5" fill="#1c1c1c"/>
    `;
}

function drawHealerAvatar(svg) {
    svg.innerHTML = `
        <circle cx="100" cy="100" r="80" fill="#2ecc71" opacity="0.2"/>
        <circle cx="100" cy="70" r="30" fill="#f4a460"/>
        <path d="M 100 50 Q 85 60 85 75 Q 85 95 100 110 Q 115 95 115 75 Q 115 60 100 50 Z" fill="#2ecc71" opacity="0.7"/>
        <rect x="90" y="100" width="20" height="50" fill="#2ecc71"/>
        <rect x="70" y="125" width="60" height="20" fill="#2ecc71"/>
        <circle cx="85" cy="85" r="5" fill="#1c1c1c"/>
        <circle cx="115" cy="85" r="5" fill="#1c1c1c"/>
        <path d="M 100 120 Q 105 135 100 145 Q 95 135 100 120" fill="#ffffff"/>
    `;
}

function drawInfluencerAvatar(svg) {
    svg.innerHTML = `
        <circle cx="100" cy="100" r="80" fill="#f39c12" opacity="0.2"/>
        <circle cx="100" cy="70" r="30" fill="#f4a460"/>
        <circle cx="100" cy="100" r="45" fill="none" stroke="#f39c12" stroke-width="3" opacity="0.6"/>
        <circle cx="100" cy="100" r="35" fill="none" stroke="#f39c12" stroke-width="2" opacity="0.4"/>
        <path d="M 60 100 L 70 95 M 140 100 L 130 95 M 100 50 L 102 62" stroke="#f39c12" stroke-width="2" stroke-linecap="round"/>
        <circle cx="85" cy="80" r="5" fill="#1c1c1c"/>
        <circle cx="115" cy="80" r="5" fill="#1c1c1c"/>
        <path d="M 95 120 Q 100 130 105 120" stroke="#f4a460" stroke-width="2" fill="none"/>
    `;
}

function drawInventorAvatar(svg) {
    svg.innerHTML = `
        <circle cx="100" cy="100" r="80" fill="#1abc9c" opacity="0.2"/>
        <circle cx="100" cy="70" r="30" fill="#f4a460"/>
        <path d="M 70 110 L 80 90 L 90 110 Z" fill="#1abc9c"/>
        <path d="M 110 110 L 120 90 L 130 110 Z" fill="#1abc9c"/>
        <rect x="75" y="115" width="50" height="35" fill="#34495e" opacity="0.7"/>
        <circle cx="85" cy="125" r="4" fill="#1abc9c"/>
        <circle cx="100" cy="128" r="4" fill="#f39c12"/>
        <circle cx="115" cy="125" r="4" fill="#1abc9c"/>
        <rect x="80" y="135" width="40" height="8" fill="#1abc9c"/>
        <circle cx="85" cy="82" r="4" fill="#1c1c1c"/>
        <circle cx="115" cy="82" r="4" fill="#1c1c1c"/>
    `;
}

function drawFreelancerAvatar(svg) {
    svg.innerHTML = `
        <circle cx="100" cy="100" r="80" fill="#34495e" opacity="0.2"/>
        <circle cx="100" cy="70" r="30" fill="#f4a460"/>
        <path d="M 60 100 Q 100 60 140 100 Q 100 140 60 100 Z" fill="#34495e" opacity="0.6"/>
        <circle cx="100" cy="100" r="20" fill="#ecf0f1" opacity="0.8"/>
        <circle cx="100" cy="100" r="15" fill="#3498db"/>
        <path d="M 100 85 L 100 115 M 85 100 L 115 100" stroke="#ecf0f1" stroke-width="2"/>
        <circle cx="85" cy="80" r="5" fill="#1c1c1c"/>
        <circle cx="115" cy="80" r="5" fill="#1c1c1c"/>
    `;
}

// Questions data
const QUESTIONS = [
    {
        questionKey: 'questions.q1.text',
        options: [
            { text: 'questions.q1.a', types: ['ceo', 'inventor'] },
            { text: 'questions.q1.b', types: ['artist', 'influencer'] },
            { text: 'questions.q1.c', types: ['scholar', 'healer'] },
            { text: 'questions.q1.d', types: ['adventurer', 'freelancer'] }
        ]
    },
    {
        questionKey: 'questions.q2.text',
        options: [
            { text: 'questions.q2.a', types: ['ceo'] },
            { text: 'questions.q2.b', types: ['artist', 'healer'] },
            { text: 'questions.q2.c', types: ['scholar', 'inventor'] },
            { text: 'questions.q2.d', types: ['adventurer'] }
        ]
    },
    {
        questionKey: 'questions.q3.text',
        options: [
            { text: 'questions.q3.a', types: ['influencer', 'ceo'] },
            { text: 'questions.q3.b', types: ['artist'] },
            { text: 'questions.q3.c', types: ['healer', 'freelancer'] },
            { text: 'questions.q3.d', types: ['scholar'] }
        ]
    },
    {
        questionKey: 'questions.q4.text',
        options: [
            { text: 'questions.q4.a', types: ['scholar', 'inventor'] },
            { text: 'questions.q4.b', types: ['ceo'] },
            { text: 'questions.q4.c', types: ['adventurer'] },
            { text: 'questions.q4.d', types: ['healer'] }
        ]
    },
    {
        questionKey: 'questions.q5.text',
        options: [
            { text: 'questions.q5.a', types: ['freelancer'] },
            { text: 'questions.q5.b', types: ['artist', 'influencer'] },
            { text: 'questions.q5.c', types: ['ceo', 'scholar'] },
            { text: 'questions.q5.d', types: ['adventurer', 'inventor'] }
        ]
    },
    {
        questionKey: 'questions.q6.text',
        options: [
            { text: 'questions.q6.a', types: ['ceo'] },
            { text: 'questions.q6.b', types: ['artist'] },
            { text: 'questions.q6.c', types: ['healer', 'freelancer'] },
            { text: 'questions.q6.d', types: ['scholar', 'inventor'] }
        ]
    },
    {
        questionKey: 'questions.q7.text',
        options: [
            { text: 'questions.q7.a', types: ['inventor'] },
            { text: 'questions.q7.b', types: ['healer'] },
            { text: 'questions.q7.c', types: ['influencer', 'artist'] },
            { text: 'questions.q7.d', types: ['ceo'] }
        ]
    },
    {
        questionKey: 'questions.q8.text',
        options: [
            { text: 'questions.q8.a', types: ['adventurer', 'freelancer'] },
            { text: 'questions.q8.b', types: ['scholar'] },
            { text: 'questions.q8.c', types: ['artist'] },
            { text: 'questions.q8.d', types: ['ceo', 'influencer'] }
        ]
    },
    {
        questionKey: 'questions.q9.text',
        options: [
            { text: 'questions.q9.a', types: ['healer'] },
            { text: 'questions.q9.b', types: ['artist', 'inventor'] },
            { text: 'questions.q9.c', types: ['ceo'] },
            { text: 'questions.q9.d', types: ['freelancer'] }
        ]
    },
    {
        questionKey: 'questions.q10.text',
        options: [
            { text: 'questions.q10.a', types: ['influencer'] },
            { text: 'questions.q10.b', types: ['scholar'] },
            { text: 'questions.q10.c', types: ['adventurer'] },
            { text: 'questions.q10.d', types: ['healer'] }
        ]
    },
    {
        questionKey: 'questions.q11.text',
        options: [
            { text: 'questions.q11.a', types: ['ceo', 'inventor'] },
            { text: 'questions.q11.b', types: ['artist', 'freelancer'] },
            { text: 'questions.q11.c', types: ['healer'] },
            { text: 'questions.q11.d', types: ['scholar'] }
        ]
    },
    {
        questionKey: 'questions.q12.text',
        options: [
            { text: 'questions.q12.a', types: ['freelancer'] },
            { text: 'questions.q12.b', types: ['ceo'] },
            { text: 'questions.q12.c', types: ['artist', 'healer'] },
            { text: 'questions.q12.d', types: ['adventurer', 'inventor'] }
        ]
    }
];
