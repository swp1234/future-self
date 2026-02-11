/**
 * Future Self Quiz Application
 * Main app logic
 */

class FutureSelfApp {
    constructor() {
        this.currentQuestion = 0;
        this.scores = {};
        this.selectedAnswers = [];
        this.isLoading = true;

        // Initialize type scores
        Object.keys(FUTURE_TYPES).forEach(type => {
            this.scores[type] = 0;
        });

        this.initializeApp();
    }

    async initializeApp() {
        try {
            // Initialize theme
            const savedTheme = localStorage.getItem('theme') || 'dark';
            document.documentElement.setAttribute('data-theme', savedTheme);
            const themeBtn = document.getElementById('theme-toggle');
            if (themeBtn) {
                themeBtn.textContent = savedTheme === 'light' ? '🌙' : '☀️';
            }

            // Initialize i18n
            await i18n.init();

            // Setup event listeners
            this.setupEventListeners();

            // Hide loader
            setTimeout(() => {
                document.getElementById('app-loader').classList.add('hidden');
                this.isLoading = false;
            }, 500);

            // Push initial state for back button
            window.history.pushState({ page: 'intro' }, null);
        } catch (error) {
            console.error('App initialization error:', error);
        }
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Language toggle
        document.getElementById('lang-toggle').addEventListener('click', () => {
            this.toggleLanguageMenu();
        });

        // Language options
        document.querySelectorAll('.lang-option').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                await i18n.setLanguage(e.target.getAttribute('data-lang'));
                this.updateLanguageMenu();
                this.hideLanguageMenu();
            });
        });

        // Close language menu when clicking outside
        document.addEventListener('click', (e) => {
            const langSelector = document.querySelector('.language-selector');
            if (!langSelector.contains(e.target)) {
                this.hideLanguageMenu();
            }
        });

        // Start button
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startQuiz();
        });

        // Back button in quiz
        document.getElementById('progress-back').addEventListener('click', () => {
            if (this.currentQuestion > 0) {
                this.currentQuestion--;
                this.selectedAnswers.pop();
                this.showQuestion();
            } else {
                this.goToIntro();
            }
        });

        // Option buttons
        document.querySelectorAll('.option-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                this.selectAnswer(index);
            });
        });

        // Result action buttons
        document.getElementById('download-btn').addEventListener('click', () => {
            this.downloadResult();
        });

        document.getElementById('share-btn').addEventListener('click', () => {
            this.shareResult();
        });

        document.getElementById('retry-btn').addEventListener('click', () => {
            this.resetQuiz();
        });

        // Back button support
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page === 'intro') {
                this.goToIntro();
            }
        });
    }

    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme') || 'dark';
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', nextTheme);
        localStorage.setItem('theme', nextTheme);
        
        const btn = document.getElementById('theme-toggle');
        if (btn) {
            btn.textContent = nextTheme === 'light' ? '🌙' : '☀️';
        }
    }

    toggleLanguageMenu() {
        const menu = document.getElementById('lang-menu');
        menu.classList.toggle('hidden');
    }

    hideLanguageMenu() {
        document.getElementById('lang-menu').classList.add('hidden');
    }

    updateLanguageMenu() {
        document.querySelectorAll('.lang-option').forEach(btn => {
            const lang = btn.getAttribute('data-lang');
            if (lang === i18n.getCurrentLanguage()) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    startQuiz() {
        this.currentQuestion = 0;
        this.selectedAnswers = [];
        Object.keys(FUTURE_TYPES).forEach(type => {
            this.scores[type] = 0;
        });

        this.showScreen('quiz-screen');
        this.showQuestion();
        window.history.pushState({ page: 'quiz', question: 0 }, null);
    }

    showQuestion() {
        const question = QUESTIONS[this.currentQuestion];
        const questionText = document.getElementById('question-text');
        const optionsContainer = document.querySelector('.options-container');

        // Update question text
        questionText.textContent = i18n.t(question.questionKey);

        // Update progress
        document.getElementById('current-question').textContent = this.currentQuestion + 1;
        const progressPercent = ((this.currentQuestion + 1) / QUESTIONS.length) * 100;
        document.getElementById('progress-fill').style.width = `${progressPercent}%`;

        // Clear and update options
        optionsContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = i18n.t(option.text);
            btn.setAttribute('data-index', index);

            // Check if this answer was already selected
            if (this.selectedAnswers[this.currentQuestion] === index) {
                btn.classList.add('selected');
            }

            btn.addEventListener('click', () => {
                this.selectAnswer(index);
            });

            optionsContainer.appendChild(btn);
        });

        // Animate question
        document.querySelector('.question-container').style.animation = 'none';
        setTimeout(() => {
            document.querySelector('.question-container').style.animation = 'slideIn 0.5s ease';
        }, 10);
    }

    selectAnswer(optionIndex) {
        const question = QUESTIONS[this.currentQuestion];
        const selectedOption = question.options[optionIndex];

        // Store answer
        this.selectedAnswers[this.currentQuestion] = optionIndex;

        // Update scores
        selectedOption.types.forEach(type => {
            this.scores[type]++;
        });

        // Move to next question
        this.currentQuestion++;

        if (this.currentQuestion < QUESTIONS.length) {
            this.showQuestion();
            window.history.pushState({ page: 'quiz', question: this.currentQuestion }, null);
        } else {
            this.showResult();
        }
    }

    showResult() {
        // Calculate final type
        const resultType = this.calculateResult();
        const futureType = FUTURE_TYPES[resultType];

        // Update result UI
        document.getElementById('result-type-name').textContent = i18n.t(futureType.nameKey);
        document.getElementById('result-description').textContent = i18n.t(futureType.descriptionKey);
        document.getElementById('result-characteristics').textContent = i18n.t(futureType.characteristicsKey);
        document.getElementById('result-advice').textContent = i18n.t(futureType.adviceKey);
        document.getElementById('result-wisdom').textContent = `"${i18n.t(futureType.wisdomKey)}"`;

        // Draw avatar
        const svg = document.getElementById('result-avatar');
        futureType.avatar(svg);

        // Store result for sharing
        this.currentResult = {
            type: resultType,
            futureType: futureType,
            emoji: futureType.emoji,
            name: i18n.t(futureType.nameKey)
        };

        this.showScreen('result-screen');
        window.history.pushState({ page: 'result' }, null);
    }

    calculateResult() {
        let maxScore = 0;
        let resultType = 'freelancer';

        for (const [type, score] of Object.entries(this.scores)) {
            if (score > maxScore) {
                maxScore = score;
                resultType = type;
            }
        }

        return resultType;
    }

    downloadResult() {
        const canvas = document.getElementById('result-canvas');
        canvas.width = 800;
        canvas.height = 1000;
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#0f0f23';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#3498db');
        gradient.addColorStop(1, '#2ecc71');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(i18n.t('result.canvasTitle'), canvas.width / 2, 100);

        // Result type
        ctx.font = 'bold 64px sans-serif';
        ctx.fillText(this.currentResult.emoji, canvas.width / 2, 250);

        ctx.font = 'bold 56px sans-serif';
        ctx.fillText(this.currentResult.name, canvas.width / 2, 350);

        // Info
        ctx.font = '24px sans-serif';
        ctx.fillText('dopabrain.com/future-self', canvas.width / 2, 900);

        // Download
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `future-self-${this.currentResult.type}.png`;
            link.click();
            URL.revokeObjectURL(url);
        });
    }

    shareResult() {
        const text = `${i18n.t('result.shareMessage')} ${this.currentResult.emoji} ${this.currentResult.name}${i18n.t('result.shareThanks')}`;
        const url = 'https://dopabrain.com/future-self/';

        // Check if Web Share API is available
        if (navigator.share) {
            navigator.share({
                title: i18n.t('result.shareWebTitle'),
                text: text,
                url: url
            }).catch(err => console.log('Share error:', err));
        } else {
            // Fallback: Copy to clipboard
            const shareText = `${text}\n\n${url}`;
            navigator.clipboard.writeText(shareText).then(() => {
                alert(i18n.t('result.shareLinkCopied'));
            }).catch(err => console.log('Copy error:', err));
        }
    }

    goToIntro() {
        this.showScreen('intro-screen');
        window.history.pushState({ page: 'intro' }, null);
    }

    resetQuiz() {
        this.goToIntro();
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FutureSelfApp();
});

// Push AdSense ads
document.addEventListener('DOMContentLoaded', () => {
    if (window.adsbygoogle) {
        window.adsbygoogle.push({});
    }
});
