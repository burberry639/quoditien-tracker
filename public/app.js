/* ========================================
   CONFIGURATION DE BASE
======================================== */

// Configurations par religion
const religionConfigs = {
    islam: {
        name: 'Islam',
        icon: '☪️',
        habits: [
            'sommeil', 'sport', 'proteines',
            'douche-matin', 'douche-soir', 
            'brossage-matin', 'brossage-midi', 'brossage-soir',
            'ongles', 'rasage',
            'fajr', 'dhuhr', 'asr', 'maghrib', 'isha',
            'chambre', 'peches'
        ],
        habitLabels: {
            'fajr': 'Fajr (Aube)',
            'dhuhr': 'Dhuhr (Midi)',
            'asr': 'Asr (Après-midi)',
            'maghrib': 'Maghrib (Coucher du soleil)',
            'isha': 'Isha (Nuit)',
            'peches': 'Aucun acte en rapport avec les 7 péchés capitaux'
        },
        categoryIcons: {
            spiritual: '🕌'
        },
        categoryNames: {
            spiritual: 'Prières',
            ethics: 'Spiritualité'
        }
    },
    christianity: {
        name: 'Christianisme',
        icon: '✝️',
        habits: [
            'sommeil', 'sport', 'proteines',
            'douche-matin', 'douche-soir', 
            'brossage-matin', 'brossage-midi', 'brossage-soir',
            'ongles', 'rasage',
            'priere-matin', 'priere-midi', 'priere-soir', 'priere-repas', 'priere-nuit',
            'chambre', 'commandements'
        ],
        habitLabels: {
            'priere-matin': 'Prière du matin',
            'priere-midi': 'Prière de midi',
            'priere-soir': 'Prière du soir',
            'priere-repas': 'Prière avant repas',
            'priere-nuit': 'Prière avant de dormir',
            'commandements': 'Respecter les enseignements du Christ'
        },
        categoryIcons: {
            spiritual: '⛪'
        },
        categoryNames: {
            spiritual: 'Prières',
            ethics: 'Spiritualité'
        }
    },
    neutral: {
        name: 'Neutre',
        icon: '🌟',
        habits: [
            'sommeil', 'sport', 'proteines',
            'douche-matin', 'douche-soir', 
            'brossage-matin', 'brossage-midi', 'brossage-soir',
            'ongles', 'rasage',
            'meditation-matin', 'meditation-midi', 'meditation-soir', 'gratitude', 'journal',
            'chambre', 'ethique'
        ],
        habitLabels: {
            'meditation-matin': 'Méditation/réflexion du matin',
            'meditation-midi': 'Pause méditative à midi',
            'meditation-soir': 'Méditation du soir',
            'gratitude': 'Moment de gratitude',
            'journal': 'Journal personnel',
            'ethique': 'Agir selon mes valeurs éthiques'
        },
        categoryIcons: {
            spiritual: '🧘'
        },
        categoryNames: {
            spiritual: 'Bien-être Mental',
            ethics: 'Développement Personnel'
        }
    }
};

let currentConfig = null;
let habits = [];

const baseStatMapping = {
    'sport': 'str',
    'proteines': 'str',
    'chambre': 'dis',
    'sommeil': 'hp',
    'douche-matin': 'hp',
    'douche-soir': 'hp',
    'brossage-matin': 'end',
    'brossage-soir': 'end',
    'brossage-midi': 'men',
    'ongles': 'men',
    'rasage': 'men'
};

const spiritualStatMapping = {
    // Islam
    'fajr': 'spi', 'dhuhr': 'spi', 'asr': 'spi', 'maghrib': 'spi', 'isha': 'spi',
    'peches': 'spi',
    // Christianity
    'priere-matin': 'spi', 'priere-midi': 'spi', 'priere-soir': 'spi', 
    'priere-repas': 'spi', 'priere-nuit': 'spi',
    'commandements': 'spi',
    // Neutral
    'meditation-matin': 'men', 'meditation-midi': 'men', 'meditation-soir': 'men',
    'gratitude': 'spi', 'journal': 'men',
    'ethique': 'spi'
};

const statMapping = { ...baseStatMapping, ...spiritualStatMapping };

const rankSystem = [
    { name: 'F', days: 14, color: '#808080' },
    { name: 'E', days: 21, color: '#8B4513' },
    { name: 'D', days: 28, color: '#CD7F32' },
    { name: 'C', days: 35, color: '#C0C0C0' },
    { name: 'B', days: 42, color: '#4169E1' },
    { name: 'A', days: 56, color: '#9370DB' },
    { name: 'S', days: 70, color: '#FFD700' },
    { name: 'SS', days: 90, color: '#FF6347' },
    { name: 'SSS', days: 120, color: '#FF1493' }
];

let soundEnabled = true;

/* ========================================
   FONCTIONS UTILITAIRES
======================================== */

function showReligionSelector() {
    const overlay = document.createElement('div');
    overlay.id = 'religionOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        backdrop-filter: blur(10px);
    `;
    
    overlay.innerHTML = `
        <div style="
            max-width: 800px;
            padding: 40px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 3px solid #00d9ff;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 0 50px rgba(0, 217, 255, 0.5);
        ">
            <h1 style="
                font-size: 2.5em;
                color: #00d9ff;
                margin-bottom: 20px;
                text-shadow: 0 0 20px rgba(0, 217, 255, 0.8);
            ">⚔️ CHOISIS TON CHEMIN ⚔️</h1>
            <p style="
                font-size: 1.2em;
                color: #aaa;
                margin-bottom: 40px;
            ">Sélectionne ta configuration spirituelle</p>
            
            <div style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            ">
                <button onclick="selectReligion('islam')" style="
                    padding: 30px 20px;
                    background: linear-gradient(135deg, #00cc66, #008844);
                    border: none;
                    border-radius: 15px;
                    color: white;
                    font-size: 1.5em;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 5px 20px rgba(0, 204, 102, 0.4);
                ">
                    <div style="font-size: 3em; margin-bottom: 10px;">☪️</div>
                    <div style="font-weight: bold;">ISLAM</div>
                </button>
                
                <button onclick="selectReligion('christianity')" style="
                    padding: 30px 20px;
                    background: linear-gradient(135deg, #667eea, #4a5fd4);
                    border: none;
                    border-radius: 15px;
                    color: white;
                    font-size: 1.5em;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
                ">
                    <div style="font-size: 3em; margin-bottom: 10px;">✝️</div>
                    <div style="font-weight: bold;">CHRISTIANISME</div>
                </button>
                
                <button onclick="selectReligion('neutral')" style="
                    padding: 30px 20px;
                    background: linear-gradient(135deg, #ffa500, #ff6b00);
                    border: none;
                    border-radius: 15px;
                    color: white;
                    font-size: 1.5em;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 5px 20px rgba(255, 165, 0, 0.4);
                ">
                    <div style="font-size: 3em; margin-bottom: 10px;">🌟</div>
                    <div style="font-weight: bold;">NEUTRE</div>
                </button>
            </div>
            
            <p style="
                font-size: 0.9em;
                color: #666;
                margin-top: 20px;
            ">Tu pourras changer ce choix plus tard dans les paramètres</p>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

function selectReligion(religion) {
    localStorage.setItem('selectedReligion', religion);
    currentConfig = religionConfigs[religion];
    habits = currentConfig.habits;
    
    const overlay = document.getElementById('religionOverlay');
    if (overlay) {
        overlay.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => overlay.remove(), 300);
    }
    
    updateHabitLabels();
    initializeApp();
}

function updateHabitLabels() {
    if (!currentConfig) return;
    
    // Mettre à jour les labels des catégories spirituelles
    const spiritualCategory = document.querySelector('.category:has(#' + habits[10] + ')');
    if (spiritualCategory) {
        const h2 = spiritualCategory.querySelector('h2');
        if (h2) {
            const icon = h2.querySelector('.category-icon');
            if (icon) {
                icon.textContent = currentConfig.categoryIcons.spiritual;
            }
            h2.childNodes[1].textContent = ' ' + currentConfig.categoryNames.spiritual;
        }
    }
}

function loadReligionConfig() {
    const savedReligion = localStorage.getItem('selectedReligion');
    if (!savedReligion) {
        showReligionSelector();
        return false;
    }
    currentConfig = religionConfigs[savedReligion];
    habits = currentConfig.habits;
    return true;
}

function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

function updateDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    document.getElementById('dateDisplay').textContent = today.toLocaleDateString('fr-FR', options);
}

function playSound(type) {
    if (!soundEnabled) return;
    const sounds = {
        'check': 1046.50,
        'levelUp': 1318.51,
        'click': 880.00
    };
    const freq = sounds[type] || 880;
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch(e) {}
}

/* ========================================
   SYSTÈME DE THÈME
======================================== */

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    playSound('click');
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('soundEnabled', soundEnabled);
    playSound('click');
}

/* ========================================
   GESTION DES HABITUDES
======================================== */

function toggleCheckbox(id) {
    const checkbox = document.getElementById(id);
    checkbox.checked = !checkbox.checked;
    saveHabits();
    updateProgress();
    updateStatsDisplay();
    updateStreaks();
    playSound('check');
}

function saveHabits() {
    const today = getTodayDate();
    const history = JSON.parse(localStorage.getItem('habitHistory') || '{}');
    
    if (!history[today]) {
        history[today] = { habits: {}, date: today };
    }
    
    habits.forEach(habit => {
        const checkbox = document.getElementById(habit);
        history[today].habits[habit] = checkbox.checked;
    });
    
    localStorage.setItem('habitHistory', JSON.stringify(history));
}

function loadHabits() {
    const today = getTodayDate();
    const history = JSON.parse(localStorage.getItem('habitHistory') || '{}');
    
    if (history[today] && history[today].habits) {
        habits.forEach(habit => {
            const checkbox = document.getElementById(habit);
            checkbox.checked = history[today].habits[habit] || false;
        });
    }
}

function updateProgress() {
    let completed = 0;
    habits.forEach(habit => {
        if (document.getElementById(habit).checked) {
            completed++;
        }
    });
    
    const percentage = Math.round((completed / habits.length) * 100);
    
    document.getElementById('completedCount').textContent = completed;
    document.getElementById('percentCount').textContent = percentage + '%';
    document.getElementById('progressFill').style.width = percentage + '%';
    document.getElementById('progressFill').textContent = percentage + '%';
    
    // Ajouter des points de rang selon progression
    if (percentage === 100) {
        addRankProgress(1); // Journée parfaite = +1 jour
    } else if (percentage >= 50) {
        addRankProgress(0.5); // Demi-journée = +0.5 jour
    }
}

function addRankProgress(points) {
    const today = getTodayDate();
    const lastUpdate = localStorage.getItem('lastRankUpdate') || '';
    
    if (lastUpdate !== today) {
        let currentPoints = parseFloat(localStorage.getItem('rankProgressPoints') || '0');
        currentPoints += points;
        localStorage.setItem('rankProgressPoints', currentPoints.toString());
        localStorage.setItem('lastRankUpdate', today);
        updateRankSystem();
    }
}

function resetAll() {
    if (confirm('Réinitialiser toutes les habitudes pour demain ?')) {
        habits.forEach(habit => {
            document.getElementById(habit).checked = false;
        });
        saveHabits();
        updateProgress();
        updateStatsDisplay();
        updateStreaks();
        playSound('click');
    }
}

/* ========================================
   SYSTÈME DE RANGS
======================================== */

function updateRankSystem() {
    const progressPoints = parseFloat(localStorage.getItem('rankProgressPoints') || '0');
    
    let remainingPoints = progressPoints;
    let currentIndex = 0;
    let pointsInCurrentRank = 0;
    
    for (let i = 0; i < rankSystem.length; i++) {
        if (remainingPoints >= rankSystem[i].days) {
            remainingPoints -= rankSystem[i].days;
            currentIndex++;
        } else {
            pointsInCurrentRank = remainingPoints;
            break;
        }
    }
    
    if (currentIndex >= rankSystem.length) {
        currentIndex = rankSystem.length - 1;
        pointsInCurrentRank = rankSystem[currentIndex].days;
    }
    
    const currentRank = rankSystem[currentIndex];
    const nextRank = currentIndex < rankSystem.length - 1 ? rankSystem[currentIndex + 1] : currentRank;
    
    const daysRequired = currentRank.days;
    const daysRemaining = daysRequired - pointsInCurrentRank;
    const percentage = Math.round((pointsInCurrentRank / daysRequired) * 100);
    
    document.getElementById('currentRank').textContent = currentRank.name;
    document.getElementById('nextRank').textContent = nextRank.name;
    document.getElementById('daysCompleted').textContent = pointsInCurrentRank.toFixed(1);
    document.getElementById('daysTotal').textContent = daysRequired;
    document.getElementById('daysRemaining').textContent = daysRemaining.toFixed(1);
    document.getElementById('rankPercentage').textContent = percentage + '%';
    
    const progressFill = document.getElementById('rankProgressFill');
    progressFill.style.width = percentage + '%';
    progressFill.textContent = percentage + '%';
    
    document.getElementById('totalProgressPoints').textContent = progressPoints.toFixed(1);
}

/* ========================================
   SYSTÈME DE STATS RPG
======================================== */

function calculateStats() {
    const history = JSON.parse(localStorage.getItem('habitHistory') || '{}');
    const dates = Object.keys(history).sort().slice(-30);
    
    const stats = { str: 0, dis: 0, spi: 0, hp: 0, end: 0, men: 0 };
    
    // Stats d'aujourd'hui EN TEMPS RÉEL
    habits.forEach(habit => {
        const checkbox = document.getElementById(habit);
        if (checkbox && checkbox.checked) {
            const statType = statMapping[habit];
            if (statType) {
                stats[statType] += 1;
            }
        }
    });
    
    // Stats de l'historique
    dates.forEach(date => {
        const dayData = history[date];
        if (dayData && dayData.habits) {
            Object.keys(dayData.habits).forEach(habit => {
                if (dayData.habits[habit] === true) {
                    const statType = statMapping[habit];
                    if (statType) {
                        stats[statType] += 1;
                    }
                }
            });
        }
    });
    
    return stats;
}

function getStatRank(value) {
    if (value >= 500) return { rank: 'SSS', class: 'rank-sss' };
    if (value >= 400) return { rank: 'SS', class: 'rank-ss' };
    if (value >= 300) return { rank: 'S', class: 'rank-s' };
    if (value >= 200) return { rank: 'A', class: 'rank-a' };
    if (value >= 150) return { rank: 'B', class: 'rank-b' };
    if (value >= 100) return { rank: 'C', class: 'rank-c' };
    if (value >= 50) return { rank: 'D', class: 'rank-d' };
    if (value >= 20) return { rank: 'E', class: 'rank-e' };
    return { rank: 'F', class: 'rank-f' };
}

function updateStatsDisplay() {
    const stats = calculateStats();
    
    const maxValues = { str: 100, dis: 150, spi: 200, hp: 100, end: 150, men: 100 };
    
    Object.keys(stats).forEach(stat => {
        const value = stats[stat];
        const percentage = Math.min((value / maxValues[stat]) * 100, 100);
        
        const rankData = getStatRank(value);
        
        const valueElement = document.getElementById(`${stat}Value`);
        if (valueElement) {
            valueElement.textContent = rankData.rank;
            valueElement.className = 'stat-value ' + rankData.class;
            valueElement.title = `${value} points`;
        }
        
        const barElement = document.getElementById(`${stat}Bar`);
        if (barElement) {
            barElement.style.width = percentage + '%';
        }
    });
    
    const powerLevel = Object.values(stats).reduce((sum, val) => sum + val, 0);
    const powerElement = document.getElementById('powerLevel');
    if (powerElement) {
        powerElement.textContent = powerLevel;
    }
    
    // Dessiner le graphique radar
    drawRadarChart(stats, maxValues);
}

function drawRadarChart(stats, maxValues) {
    const canvas = document.getElementById('radarChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const isMobile = window.innerWidth <= 768;
    
    // Taille responsive
    const size = isMobile ? Math.min(window.innerWidth - 80, 300) : 400;
    canvas.width = size;
    canvas.height = size;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - (isMobile ? 40 : 60);
    
    const statOrder = ['str', 'dis', 'spi', 'hp', 'end', 'men'];
    const labels = isMobile 
        ? ['STR', 'DIS', 'SPI', 'HP', 'END', 'MEN']
        : ['FORCE', 'DISCIPLINE', 'SPIRITUALITÉ', 'SANTÉ', 'ENDURANCE', 'MENTAL'];
    const colors = ['#ff6b6b', '#4ecdc4', '#ffd700', '#96fbc4', '#fa709a', '#667eea'];
    
    // Cercles de fond
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, (radius / 5) * i, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    statOrder.forEach((stat, index) => {
        const angle = (Math.PI * 2 * index) / statOrder.length - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        // Labels
        const labelDistance = isMobile ? 30 : 40;
        const labelX = centerX + Math.cos(angle) * (radius + labelDistance);
        const labelY = centerY + Math.sin(angle) * (radius + labelDistance);
        
        ctx.fillStyle = colors[index];
        ctx.font = isMobile ? 'bold 10px Arial' : 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labels[index], labelX, labelY);
    });
    
    // Polygone des stats
    ctx.beginPath();
    statOrder.forEach((stat, index) => {
        const value = stats[stat];
        const maxValue = maxValues[stat];
        const percentage = Math.min(value / maxValue, 1);
        
        const angle = (Math.PI * 2 * index) / statOrder.length - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius * percentage;
        const y = centerY + Math.sin(angle) * radius * percentage;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.closePath();
    
    // Remplissage
    ctx.fillStyle = 'rgba(102, 126, 234, 0.3)';
    ctx.fill();
    
    // Contour
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = isMobile ? 2 : 3;
    ctx.stroke();
    
    // Points
    statOrder.forEach((stat, index) => {
        const value = stats[stat];
        const maxValue = maxValues[stat];
        const percentage = Math.min(value / maxValue, 1);
        
        const angle = (Math.PI * 2 * index) / statOrder.length - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius * percentage;
        const y = centerY + Math.sin(angle) * radius * percentage;
        
        ctx.beginPath();
        ctx.arc(x, y, isMobile ? 4 : 6, 0, Math.PI * 2);
        ctx.fillStyle = colors[index];
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

/* ========================================
   SYSTÈME DE STREAKS
======================================== */

function updateStreaks() {
    const today = getTodayDate();
    
    let completed = 0;
    habits.forEach(habit => {
        if (document.getElementById(habit).checked) {
            completed++;
        }
    });
    const todayPerfect = completed === habits.length;
    
    let currentStreak = parseInt(localStorage.getItem('currentStreak') || '0');
    let bestStreak = parseInt(localStorage.getItem('bestStreak') || '0');
    let lastStreakDate = localStorage.getItem('lastStreakDate') || '';
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (lastStreakDate !== today) {
        if (lastStreakDate === yesterdayStr) {
            if (todayPerfect) {
                currentStreak++;
                localStorage.setItem('lastStreakDate', today);
            }
        } else if (lastStreakDate !== today) {
            if (todayPerfect) {
                currentStreak = 1;
                localStorage.setItem('lastStreakDate', today);
            } else {
                currentStreak = 0;
            }
        }
        
        if (currentStreak > bestStreak) {
            bestStreak = currentStreak;
            localStorage.setItem('bestStreak', bestStreak.toString());
        }
        
        localStorage.setItem('currentStreak', currentStreak.toString());
    } else if (todayPerfect && currentStreak === 0) {
        currentStreak = 1;
        localStorage.setItem('currentStreak', '1');
        localStorage.setItem('lastStreakDate', today);
        if (bestStreak === 0) {
            localStorage.setItem('bestStreak', '1');
            bestStreak = 1;
        }
    }
    
    document.getElementById('currentStreak').textContent = `${currentStreak} jour${currentStreak > 1 ? 's' : ''}`;
    document.getElementById('bestStreak').textContent = `${bestStreak} jour${bestStreak > 1 ? 's' : ''}`;
    
    const bonusContainer = document.getElementById('streakBonus');
    if (currentStreak >= 7) {
        bonusContainer.style.display = 'block';
        bonusContainer.textContent = `🔥 SÉRIE DE ${currentStreak} JOURS ! Continue ! 🔥`;
    } else {
        bonusContainer.style.display = 'none';
    }
}

/* ========================================
   SYSTÈME DE QUÊTES QUOTIDIENNES
======================================== */

const allQuests = [
    { id: 'quest-sport', name: '💪 Séance de sport intense', reward: 'str', bonus: '+0.5 jour de rang' },
    { id: 'quest-prayers', name: '🕌 Toutes les 5 prières à l\'heure', reward: 'spi', bonus: '+0.5 jour de rang' },
    { id: 'quest-study', name: '📚 1h d\'étude/lecture', reward: 'men', bonus: '+0.5 jour de rang' },
    { id: 'quest-hygiene', name: '🧼 Hygiène parfaite toute la journée', reward: 'hp', bonus: '+0.5 jour de rang' },
    { id: 'quest-discipline', name: '🎯 Zéro distraction aujourd\'hui', reward: 'dis', bonus: '+0.5 jour de rang' },
    { id: 'quest-cardio', name: '🏃 30min de cardio', reward: 'end', bonus: '+0.5 jour de rang' },
    { id: 'quest-nutrition', name: '🍗 Nutrition parfaite', reward: 'str', bonus: '+0.5 jour de rang' },
    { id: 'quest-wake', name: '⏰ Réveil à 5h du matin', reward: 'dis', bonus: '+0.5 jour de rang' }
];

function initDailyQuests() {
    const today = getTodayDate();
    const savedDate = localStorage.getItem('questsDate');
    
    if (savedDate !== today) {
        const shuffled = [...allQuests].sort(() => Math.random() - 0.5);
        const dailyQuests = shuffled.slice(0, 5).map(q => q.id);
        localStorage.setItem('dailyQuests', JSON.stringify(dailyQuests));
        localStorage.setItem('questsDate', today);
        
        dailyQuests.forEach(qid => localStorage.removeItem('quest_' + qid));
    }
    
    displayDailyQuests();
    updateQuestTimer();
    setInterval(updateQuestTimer, 1000);
}

function displayDailyQuests() {
    const dailyQuests = JSON.parse(localStorage.getItem('dailyQuests') || '[]');
    const container = document.getElementById('dailyQuestsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    dailyQuests.forEach(questId => {
        const quest = allQuests.find(q => q.id === questId);
        if (!quest) return;
        
        const completed = localStorage.getItem('quest_' + questId) === 'true';
        
        const questDiv = document.createElement('div');
        questDiv.className = 'quest-item' + (completed ? ' completed' : '');
        questDiv.innerHTML = `
            <div class="quest-info">
                <div class="quest-name">${quest.name}</div>
                <div class="quest-reward">${quest.bonus}</div>
            </div>
            <button class="quest-btn" onclick="completeQuest('${questId}')" ${completed ? 'disabled' : ''}>
                ${completed ? '✓ Terminée' : 'Compléter'}
            </button>
        `;
        
        container.appendChild(questDiv);
    });
    
    updateQuestStats();
}

function completeQuest(questId) {
    localStorage.setItem('quest_' + questId, 'true');
    
    // +0.5 jour de rang par quête !
    let currentPoints = parseFloat(localStorage.getItem('rankProgressPoints') || '0');
    currentPoints += 0.5;
    localStorage.setItem('rankProgressPoints', currentPoints.toString());
    
    playSound('levelUp');
    displayDailyQuests();
    updateRankSystem();
}

function updateQuestStats() {
    const dailyQuests = JSON.parse(localStorage.getItem('dailyQuests') || '[]');
    let completed = 0;
    
    dailyQuests.forEach(qid => {
        if (localStorage.getItem('quest_' + qid) === 'true') {
            completed++;
        }
    });
    
    document.getElementById('dailyQuestsCompleted').textContent = `${completed}/5`;
    document.getElementById('dailyQuestBonus').textContent = `+${(completed * 0.5).toFixed(1)}`;
}

function updateQuestTimer() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow - now;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    const timerElement = document.getElementById('questTimer');
    if (timerElement) {
        timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

/* ========================================
   INITIALISATION
======================================== */

function initializeApp() {
    generateHabitsHTML();
    updateDate();
    loadHabits();
    updateProgress();
    updateStatsDisplay();
    updateRankSystem();
    updateStreaks();
    initDailyQuests();
    
    window.addEventListener('resize', function() {
        updateStatsDisplay();
    });
}

function generateHabitsHTML() {
    const container = document.getElementById('habitsContainer');
    if (!container || !currentConfig) return;
    
    container.innerHTML = '';
    
    const categories = {
        sleep: { icon: '😴', name: 'Sommeil', habits: ['sommeil'] },
        sport: { icon: '💪', name: 'Sport', habits: ['sport'] },
        food: { icon: '🍗', name: 'Alimentation', habits: ['proteines'] },
        hygiene: { icon: '🧼', name: 'Hygiène', habits: ['douche-matin', 'douche-soir', 'brossage-matin', 'brossage-midi', 'brossage-soir', 'ongles', 'rasage'] },
        spiritual: { icon: currentConfig.categoryIcons.spiritual, name: currentConfig.categoryNames.spiritual, habits: [] },
        clean: { icon: '🧹', name: 'Rangement', habits: ['chambre'] },
        ethics: { icon: '✨', name: currentConfig.categoryNames.ethics, habits: [] }
    };
    
    // Habitudes spirituelles selon la religion
    if (currentConfig.name === 'Islam') {
        categories.spiritual.habits = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        categories.ethics.habits = ['peches'];
    } else if (currentConfig.name === 'Christianisme') {
        categories.spiritual.habits = ['priere-matin', 'priere-midi', 'priere-soir', 'priere-repas', 'priere-nuit'];
        categories.ethics.habits = ['commandements'];
    } else {
        categories.spiritual.habits = ['meditation-matin', 'meditation-midi', 'meditation-soir', 'gratitude', 'journal'];
        categories.ethics.habits = ['ethique'];
    }
    
    const habitLabels = {
        'sommeil': '7-8 heures de sommeil',
        'sport': 'Séance de sport aujourd\'hui',
        'proteines': '140g de protéines minimum',
        'douche-matin': 'Douche du matin',
        'douche-soir': 'Douche du soir',
        'brossage-matin': 'Brossage de dents - Matin',
        'brossage-midi': 'Brossage de dents - Midi',
        'brossage-soir': 'Brossage de dents - Soir',
        'ongles': 'Coupage d\'ongles',
        'rasage': 'Rasage',
        'chambre': 'Ranger ma chambre',
        ...currentConfig.habitLabels
    };
    
    Object.values(categories).forEach(category => {
        if (category.habits.length === 0) return;
        
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';
        
        const title = document.createElement('h2');
        title.innerHTML = `<span class="category-icon">${category.icon}</span> ${category.name}`;
        categoryDiv.appendChild(title);
        
        category.habits.forEach(habitId => {
            const habitDiv = document.createElement('div');
            habitDiv.className = 'habit-item';
            habitDiv.onclick = () => toggleCheckbox(habitId);
            
            habitDiv.innerHTML = `
                <input type="checkbox" id="${habitId}">
                <label for="${habitId}">${habitLabels[habitId] || habitId}</label>
            `;
            
            categoryDiv.appendChild(habitDiv);
        });
        
        container.appendChild(categoryDiv);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    
    if (loadReligionConfig()) {
        initializeApp();
    }
});

// Fonction globale pour sélection (appelée depuis HTML inline)
window.selectReligion = selectReligion;
