/* ========================================
   VARIABLES GLOBALES & CONFIGURATION
======================================== */

const habits = [
    'sommeil', 'sport', 'proteines',
    'douche-matin', 'douche-soir',
    'brossage-matin', 'brossage-midi', 'brossage-soir',
    'ongles', 'rasage',
    'fajr', 'dhuhr', 'asr', 'maghrib', 'isha',
    'chambre', 'peches'
];

// Système de rangs
const rankSystem = [
    { name: 'F', days: 14, color: '#8B4513' },
    { name: 'E', days: 14, color: '#CD853F' },
    { name: 'D', days: 14, color: '#DAA520' },
    { name: 'C', days: 14, color: '#FFD700' },
    { name: 'B', days: 14, color: '#32CD32' },
    { name: 'A', days: 14, color: '#00CED1' },
    { name: 'S', days: 14, color: '#1E90FF' },
    { name: 'SS', days: 14, color: '#4169E1' },
    { name: 'SSS', days: 14, color: '#8A2BE2' },
    { name: 'SR', days: 14, color: '#9370DB' },
    { name: 'SR+', days: 14, color: '#BA55D3' },
    { name: 'SSR', days: 14, color: '#FF1493' },
    { name: 'SSR+', days: 14, color: '#FF69B4' },
    { name: 'UR', days: 14, color: '#FF4500' },
    { name: 'UR+', days: 14, color: '#FF6347' },
    { name: 'LR', days: 14, color: '#FFD700' },
    { name: 'LR+', days: 14, color: '#FFA500' },
    { name: 'MR', days: 14, color: '#DC143C' },
    { name: 'MR+', days: 14, color: '#B22222' },
    { name: 'X', days: 14, color: '#8B0000' },
    { name: 'XX', days: 21, color: '#800080' },
    { name: 'XXX', days: 21, color: '#4B0082' },
    { name: 'EX', days: 21, color: '#00FFFF' },
    { name: 'DX', days: 21, color: '#00CED1' },
    { name: 'INHUMAIN', days: 21, color: '#FF00FF' },
    { name: 'DIVIN', days: 21, color: '#FFD700' },
    { name: 'INCONNU', days: 21, color: '#000000' }
];

// Mapping des habitudes vers les stats
const statMapping = {
    'sport': 'str',
    'proteines': 'str',
    'chambre': 'dis',
    'fajr': 'spi',
    'dhuhr': 'spi',
    'asr': 'spi',
    'maghrib': 'spi',
    'isha': 'spi',
    'peches': 'spi',
    'sommeil': 'hp',
    'douche-matin': 'hp',
    'douche-soir': 'hp',
    'brossage-matin': 'end',
    'brossage-soir': 'end',
    'brossage-midi': 'men',
    'ongles': 'men',
    'rasage': 'men'
};

// État du son
let soundEnabled = true;

/* ========================================
   UTILITAIRES DE BASE
======================================== */

function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

function daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(date1);
    const secondDate = new Date(date2);
    return Math.round(Math.abs((firstDate - secondDate) / oneDay));
}

function updateDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    document.getElementById('dateDisplay').textContent = today.toLocaleDateString('fr-FR', options);
}

function adjustColor(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => 
        ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2)
    );
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
    
    const icon = document.getElementById('themeIcon');
    icon.textContent = newTheme === 'light' ? '🌙' : '☀️';
    
    playSound('click');
    updateStatsDisplay();
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const html = document.documentElement;
    html.setAttribute('data-theme', savedTheme);
    
    const icon = document.getElementById('themeIcon');
    icon.textContent = savedTheme === 'light' ? '🌙' : '☀️';
}

/* ========================================
   SYSTÈME DE SON
======================================== */

function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('soundEnabled', soundEnabled);
    
    const icon = document.getElementById('soundIcon');
    icon.textContent = soundEnabled ? '🔊' : '🔇';
}

function playSound(type) {
    if (!soundEnabled) return;
    
    const audio = document.getElementById(type + 'Sound');
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Audio play failed:', e));
    }
}

function loadSoundPreference() {
    const saved = localStorage.getItem('soundEnabled');
    soundEnabled = saved === null ? true : saved === 'true';
    
    const icon = document.getElementById('soundIcon');
    icon.textContent = soundEnabled ? '🔊' : '🔇';
}

/* ========================================
   GESTION DES HABITUDES
======================================== */

function toggleCheckbox(id) {
    const checkbox = document.getElementById(id);
    checkbox.checked = !checkbox.checked;
    
    localStorage.setItem(id, checkbox.checked);
    
    if (checkbox.checked) {
        checkbox.parentElement.classList.add('checked');
        playSound('click');
    } else {
        checkbox.parentElement.classList.remove('checked');
    }
    
    updateProgress();
    updateStreaks();
    updateStatsDisplay();
}

function updateProgress() {
    let completed = 0;
    habits.forEach(habit => {
        if (document.getElementById(habit).checked) {
            completed++;
        }
    });

    const total = habits.length;
    const percentage = Math.round((completed / total) * 100);

    document.getElementById('completedCount').textContent = completed;
    document.getElementById('percentCount').textContent = percentage + '%';
    document.getElementById('progressFill').style.width = percentage + '%';
    document.getElementById('progressFill').textContent = percentage + '%';
}

function resetAll() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les cases pour aujourd\'hui ?')) {
        habits.forEach(habit => {
            const checkbox = document.getElementById(habit);
            checkbox.checked = false;
            checkbox.parentElement.classList.remove('checked');
            localStorage.removeItem(habit);
        });
        updateProgress();
        updateStreaks();
        playSound('click');
    }
}

/* ========================================
   HISTORIQUE & SAUVEGARDE
======================================== */

function saveHistory(date, habitStates) {
    let history = JSON.parse(localStorage.getItem('habitHistory') || '{}');
    
    const completed = Object.values(habitStates).filter(v => v === true).length;
    const total = habits.length;
    const percentage = Math.round((completed / total) * 100);
    
    history[date] = {
        habits: habitStates,
        completed: completed,
        total: total,
        percentage: percentage
    };
    
    const dates = Object.keys(history).sort();
    if (dates.length > 90) {
        dates.slice(0, dates.length - 90).forEach(oldDate => {
            delete history[oldDate];
        });
    }
    
    localStorage.setItem('habitHistory', JSON.stringify(history));
    
    addProgressPoints(percentage);
}

function addProgressPoints(percentage) {
    const progressPoints = percentage / 100;
    
    let currentProgress = parseFloat(localStorage.getItem('rankProgressPoints') || '0');
    currentProgress += progressPoints;
    
    localStorage.setItem('rankProgressPoints', currentProgress.toString());
    
    console.log(`📈 +${percentage}% de progression (${progressPoints.toFixed(2)} jour). Total: ${currentProgress.toFixed(2)} jours`);
}

function loadState() {
    const today = getTodayDate();
    const savedDate = localStorage.getItem('habitDate');
    
    if (savedDate && savedDate !== today) {
        console.log('📅 Nouveau jour détecté ! Passage de', savedDate, 'à', today);
        
        const previousState = {};
        habits.forEach(habit => {
            previousState[habit] = localStorage.getItem(habit) === 'true';
        });
        saveHistory(savedDate, previousState);
        
        habits.forEach(habit => {
            localStorage.removeItem(habit);
        });
        
        console.log('✅ Données du', savedDate, 'sauvegardées dans l\'historique');
    }
    
    localStorage.setItem('habitDate', today);

    habits.forEach(habit => {
        const checkbox = document.getElementById(habit);
        const isChecked = localStorage.getItem(habit) === 'true';
        checkbox.checked = isChecked;
        if (isChecked) {
            checkbox.parentElement.classList.add('checked');
        }
    });
    
    updateProgress();
}

function checkDayChange() {
    const today = getTodayDate();
    const savedDate = localStorage.getItem('habitDate');
    
    if (savedDate !== today) {
        console.log('🔄 Changement de jour détecté automatiquement !');
        location.reload();
    }
}

/* ========================================
   SYSTÈME DE RANG
======================================== */

function initRankSystem() {
    if (!localStorage.getItem('currentRankIndex')) {
        localStorage.setItem('currentRankIndex', '0');
        localStorage.setItem('rankProgressPoints', '0');
        localStorage.setItem('rankHistory', JSON.stringify([]));
    }
}

function updateRankSystem() {
    const currentRankIndex = parseInt(localStorage.getItem('currentRankIndex') || '0');
    const progressPoints = parseFloat(localStorage.getItem('rankProgressPoints') || '0');
    
    let remainingPoints = progressPoints;
    let currentIndex = 0;
    let pointsInCurrentRank = 0;
    
    for (let i = 0; i < rankSystem.length; i++) {
        if (remainingPoints >= rankSystem[i].days) {
            remainingPoints -= rankSystem[i].days;
            currentIndex++;
            
            if (currentIndex > currentRankIndex) {
                addRankToHistory(rankSystem[i].name, getTodayDate());
                localStorage.setItem('currentRankIndex', currentIndex.toString());
                showRankUpNotification(rankSystem[currentIndex].name);
            }
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
    document.getElementById('currentRank').style.background = `linear-gradient(135deg, ${currentRank.color}, ${adjustColor(currentRank.color, -20)})`;
    
    document.getElementById('nextRank').textContent = nextRank.name;
    document.getElementById('nextRank').style.background = `linear-gradient(135deg, ${nextRank.color}, ${adjustColor(nextRank.color, -20)})`;
    
    document.getElementById('daysCompleted').textContent = pointsInCurrentRank.toFixed(1);
    document.getElementById('daysTotal').textContent = daysRequired;
    document.getElementById('daysRemaining').textContent = daysRemaining.toFixed(1);
    document.getElementById('rankPercentage').textContent = percentage + '%';
    
    const progressFill = document.getElementById('rankProgressFill');
    progressFill.style.width = percentage + '%';
    progressFill.textContent = percentage + '%';
    progressFill.style.background = `linear-gradient(90deg, ${currentRank.color}, ${nextRank.color})`;
    
    document.getElementById('totalProgressPoints').textContent = progressPoints.toFixed(1);
    
    displayRankHistory();
}

function showRankUpNotification(rankName) {
    playSound('levelUp');
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #FFD700, #FFA500);
        color: white;
        padding: 30px 50px;
        border-radius: 20px;
        font-size: 2em;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        animation: rankUpAnimation 0.5s ease-out;
    `;
    notification.innerHTML = `🎉 RANG ${rankName} ATTEINT ! 🎉`;
    document.body.appendChild(notification);
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rankUpAnimation {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            50% { transform: translate(-50%, -50%) scale(1.1); }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        @keyframes fadeOut {
            to { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.5s ease-out';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

function addRankToHistory(rankName, date) {
    let history = JSON.parse(localStorage.getItem('rankHistory') || '[]');
    history.push({ rank: rankName, date: date });
    localStorage.setItem('rankHistory', JSON.stringify(history));
}

function displayRankHistory() {
    const history = JSON.parse(localStorage.getItem('rankHistory') || '[]');
    const historyList = document.getElementById('rankHistoryList');
    
    if (history.length === 0) {
        historyList.innerHTML = '<p style="color: #999; text-align: center;">Aucun rang atteint pour le moment. Continue tes efforts ! 💪</p>';
        return;
    }
    
    historyList.innerHTML = '';
    history.slice().reverse().forEach(item => {
        const div = document.createElement('div');
        div.className = 'rank-history-item';
        div.innerHTML = `
            <span class="rank-history-badge">🏆 Rang ${item.rank}</span>
            <span class="rank-history-date">${new Date(item.date).toLocaleDateString('fr-FR')}</span>
        `;
        historyList.appendChild(div);
    });
}

/* ========================================
   SYSTÈME DE STATS
======================================== */

function calculateStats() {
    const history = JSON.parse(localStorage.getItem('habitHistory') || '{}');
    const dates = Object.keys(history).sort().slice(-30);
    
    const stats = {
        str: 0,
        dis: 0,
        spi: 0,
        hp: 0,
        end: 0,
        men: 0
    };
    
    let totalDays = 0;
    let perfectDays = 0;
    
    // AJOUTER LES STATS D'AUJOURD'HUI EN TEMPS RÉEL
    habits.forEach(habit => {
        const checkbox = document.getElementById(habit);
        if (checkbox && checkbox.checked) {
            const statType = statMapping[habit];
            if (statType) {
                stats[statType] += 1;
            }
        }
    });
    
    dates.forEach(date => {
        const dayData = history[date];
        if (dayData && dayData.habits) {
            totalDays++;
            let dayCompleted = 0;
            
            Object.keys(dayData.habits).forEach(habit => {
                if (dayData.habits[habit] === true) {
                    const statType = statMapping[habit];
                    if (statType) {
                        stats[statType] += 1;
                    }
                    dayCompleted++;
                }
            });
            
            if (dayCompleted === habits.length) {
                stats.dis += 5;
                perfectDays++;
            }
        }
    });
    
    if (totalDays > 0) {
        const consistency = (perfectDays / totalDays) * 100;
        stats.end += Math.floor(consistency / 10);
    }
    
    stats.dis += totalDays;
    
    return stats;
}

function updateStatsDisplay() {
    const stats = calculateStats();
    
    const questBonuses = getDailyQuestBonuses();
    Object.keys(questBonuses).forEach(stat => {
        stats[stat] += questBonuses[stat];
    });
    
    const combatBonuses = getCombatBonuses();
    Object.keys(combatBonuses).forEach(stat => {
        stats[stat] += combatBonuses[stat];
    });
    
    const streakBonuses = getStreakBonusForDisplay();
    Object.keys(streakBonuses).forEach(stat => {
        stats[stat] += (streakBonuses[stat] || 0);
    });
    
    const maxValues = {
        str: 100,
        dis: 150,
        spi: 200,
        hp: 100,
        end: 150,
        men: 100
    };
    
    Object.keys(stats).forEach(stat => {
        const value = stats[stat];
        const percentage = Math.min((value / maxValues[stat]) * 100, 100);
        
        // Convertir la valeur en rang visuel
        const rankData = getStatRank(value);
        
        const valueElement = document.getElementById(`${stat}Value`);
        valueElement.textContent = rankData.rank;
        valueElement.className = 'stat-value ' + rankData.class;
        valueElement.title = `${value} points`; // Affiche les points au survol
        
        document.getElementById(`${stat}Bar`).style.width = percentage + '%';
    });
    
    const powerLevel = Object.values(stats).reduce((sum, val) => sum + val, 0);
    document.getElementById('powerLevel').textContent = powerLevel;
    
    drawRadarChart(stats, maxValues);
    
    return powerLevel;
}

/* ========================================
   SYSTÈME DE RANGS POUR LES STATS
======================================== */

function getStatRank(value) {
    if (value >= 20000) return { rank: 'DIVIN', class: 'rank-divin' };
    if (value >= 10000) return { rank: 'inhumain', class: 'rank-inhumain' };
    if (value >= 7000) return { rank: 'inconnue', class: 'rank-inconnue' };
    if (value >= 5000) return { rank: 'DX', class: 'rank-dx' };
    if (value >= 4000) return { rank: 'EX', class: 'rank-ex' };
    if (value >= 3000) return { rank: 'XXX', class: 'rank-xxx' };
    if (value >= 2500) return { rank: 'XX', class: 'rank-xx' };
    if (value >= 2000) return { rank: 'X', class: 'rank-x' };
    if (value >= 1600) return { rank: 'MR+', class: 'rank-mr+' };
    if (value >= 1300) return { rank: 'MR', class: 'rank-mr' };
    if (value >= 1300) return { rank: 'LR+', class: 'rank-LR+' };
    if (value >= 1000) return { rank: 'LR', class: 'rank-lr' };
    if (value >= 850) return { rank: 'UR+', class: 'rank-ur+' };
    if (value >= 700) return { rank: 'UR', class: 'rank-ur' };
    if (value >= 500) return { rank: 'SSR+', class: 'rank-ssr+' };
    if (value >= 400) return { rank: 'SR+', class: 'rank-sr+' };
    if (value >= 250) return { rank: 'SR', class: 'rank-sr' };
    if (value >= 150) return { rank: 'SSS', class: 'rank-sss' };
    if (value >= 120) return { rank: 'SS', class: 'rank-ss' };
    if (value >= 90) return { rank: 'S', class: 'rank-s' };
    if (value >= 70) return { rank: 'A', class: 'rank-a' };
    if (value >= 50) return { rank: 'B', class: 'rank-b' };
    if (value >= 35) return { rank: 'C', class: 'rank-c' };
    if (value >= 20) return { rank: 'D', class: 'rank-d' };
    if (value >= 10) return { rank: 'E', class: 'rank-e' };
    return { rank: 'F', class: 'rank-f' };
}

function getStreakBonusForDisplay() {
    const currentStreak = parseInt(localStorage.getItem('currentStreak') || '0');
    return getStreakBonus(currentStreak);
}

/* ========================================
   SYSTÈME DE STREAKS
======================================== */

function updateStreaks() {
    const today = getTodayDate();
    const history = JSON.parse(localStorage.getItem('habitHistory') || '{}');
    
    // Vérifier si aujourd'hui est à 100%
    let completed = 0;
    habits.forEach(habit => {
        if (document.getElementById(habit).checked) {
            completed++;
        }
    });
    const todayPerfect = completed === habits.length;
    
    // Récupérer les données de streak
    let currentStreak = parseInt(localStorage.getItem('currentStreak') || '0');
    let bestStreak = parseInt(localStorage.getItem('bestStreak') || '0');
    let lastStreakDate = localStorage.getItem('lastStreakDate') || '';
    
    // Si c'est un nouveau jour
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (lastStreakDate !== today) {
        // Vérifier si on vient d'hier (streak continue) ou pas (streak cassé)
        if (lastStreakDate === yesterdayStr) {
            // On continue le streak si aujourd'hui est parfait
            if (todayPerfect) {
                currentStreak++;
                localStorage.setItem('lastStreakDate', today);
            }
        } else if (lastStreakDate !== today) {
            // Streak cassé si on a sauté un jour
            if (todayPerfect) {
                currentStreak = 1;
                localStorage.setItem('lastStreakDate', today);
            } else {
                currentStreak = 0;
            }
        }
        
        // Mettre à jour le record
        if (currentStreak > bestStreak) {
            bestStreak = currentStreak;
            localStorage.setItem('bestStreak', bestStreak);
        }
        
        localStorage.setItem('currentStreak', currentStreak);
    }
    
    // Afficher les streaks
    document.getElementById('currentStreak').textContent = currentStreak + ' jour' + (currentStreak > 1 ? 's' : '');
    document.getElementById('bestStreak').textContent = bestStreak + ' jour' + (bestStreak > 1 ? 's' : '');
    
    // Calculer et afficher les bonus de streak
    updateStreakBonus(currentStreak);
}

function updateStreakBonus(streak) {
    const bonusContainer = document.getElementById('streakBonus');
    
    if (streak === 0) {
        bonusContainer.style.display = 'none';
        return;
    }
    
    bonusContainer.style.display = 'block';
    
    let bonusText = '';
    let bonusStats = getStreakBonus(streak);
    
    if (Object.keys(bonusStats).length > 0) {
        bonusText = '🔥 BONUS DE SÉRIE ACTIF : ';
        const bonusArray = [];
        Object.keys(bonusStats).forEach(stat => {
            bonusArray.push(`+${bonusStats[stat]} ${stat.toUpperCase()}`);
        });
        bonusText += bonusArray.join(', ');
    } else {
        bonusText = `🔥 Série de ${streak} jour${streak > 1 ? 's' : ''} ! Continue pour débloquer des bonus !`;
    }
    
    bonusContainer.innerHTML = bonusText;
}

function getStreakBonus(streak) {
    const bonuses = {};
    
    // Bonus tous les 7 jours
    if (streak >= 7) {
        const multiplier = Math.floor(streak / 7);
        bonuses.str = 3 * multiplier;
        bonuses.dis = 5 * multiplier;
        bonuses.end = 3 * multiplier;
    }
    
    // Bonus spéciaux pour les jalo

    /* ========================================
   SYSTÈME DE COMBAT (ARTS MARTIAUX)
======================================== */

const martialArtsEnemies = [
    {
        id: 'goblin',
        name: '🟢 Goblin Débutant',
        technique: 'Coup de Poing Basique',
        requiredPL: 0,
        reward: { str: 5, dis: 3 },
        description: 'Un adversaire parfait pour débuter'
    },
    {
        id: 'kobold',
        name: '🔵 Kobold Agile',
        technique: 'Esquive Rapide',
        requiredPL: 50,
        reward: { end: 8, men: 4 },
        description: 'Apprends la vitesse et l\'agilité'
    },
    {
        id: 'orc',
        name: '🟠 Orc Guerrier',
        technique: 'Force Brute',
        requiredPL: 150,
        reward: { str: 12, hp: 8 },
        description: 'Maîtrise la force pure'
    },
    {
        id: 'troll',
        name: '🟣 Troll Endurant',
        technique: 'Endurance Titanesque',
        requiredPL: 250,
        reward: { hp: 15, end: 12 },
        description: 'Développe ton endurance'
    },
    {
        id: 'ogre',
        name: '🔴 Ogre Destructeur',
        technique: 'Coup Dévastateur',
        requiredPL: 350,
        reward: { str: 20, dis: 10 },
        description: 'La puissance ultime'
    },
    {
        id: 'dragon',
        name: '🐉 Dragon Ancien',
        technique: 'Maîtrise Parfaite',
        requiredPL: 500,
        reward: { str: 25, dis: 20, spi: 15, hp: 20, end: 25, men: 20 },
        description: 'Le sommet des arts martiaux'
    }
];

function initCombatSystem() {
    const enemyList = document.getElementById('enemyList');
    enemyList.innerHTML = '';
    
    martialArtsEnemies.forEach(enemy => {
        const enemyCard = document.createElement('div');
        enemyCard.className = 'enemy-card';
        enemyCard.id = `enemy-${enemy.id}`;
        
        const victories = getEnemyVictories();
        const defeated = victories[enemy.id] || 0;
        const powerLevel = updateStatsDisplay();
        const canFight = powerLevel >= enemy.requiredPL;
        
        if (!canFight) {
            enemyCard.classList.add('locked');
        }
        
        enemyCard.innerHTML = `
            <div class="enemy-info">
                <div class="enemy-name">${enemy.name}</div>
                <div class="enemy-technique">Technique : ${enemy.technique}</div>
                <div class="enemy-stats">
                    <span class="enemy-stat">PL Requis : ${enemy.requiredPL}</span>
                    <span class="enemy-stat">Défaites : ${defeated}</span>
                </div>
                <div style="margin-top: 8px; font-size: 0.9em; color: var(--text-secondary);">
                    ${enemy.description}
                </div>
            </div>
            <button class="combat-btn" onclick="fightEnemy('${enemy.id}')" ${!canFight ? 'disabled' : ''}>
                ${canFight ? '⚔️ Combattre' : '🔒 Verrouillé'}
            </button>
        `;
        
        enemyList.appendChild(enemyCard);
    });
    
    displayVictories();
}

function fightEnemy(enemyId) {
    const enemy = martialArtsEnemies.find(e => e.id === enemyId);
    if (!enemy) return;
    
    const powerLevel = updateStatsDisplay();
    
    if (powerLevel < enemy.requiredPL) {
        alert(`❌ Power Level insuffisant ! Tu as besoin de ${enemy.requiredPL} PL (tu as ${powerLevel} PL)`);
        return;
    }
    
    playSound('combat');
    
    // Animation de combat
    const enemyCard = document.getElementById(`enemy-${enemyId}`);
    enemyCard.style.animation = 'shake 0.5s';
    setTimeout(() => {
        enemyCard.style.animation = '';
    }, 500);
    
    // Enregistrer la victoire
    let victories = getEnemyVictories();
    victories[enemyId] = (victories[enemyId] || 0) + 1;
    localStorage.setItem('enemyVictories', JSON.stringify(victories));
    
    // Appliquer les récompenses
    applyEnemyReward(enemy);
    
    // Notification de victoire
    showCombatNotification(enemy);
    
    // Mettre à jour l'affichage
    initCombatSystem();
    updateStatsDisplay();
}

function getEnemyVictories() {
    return JSON.parse(localStorage.getItem('enemyVictories') || '{}');
}

function applyEnemyReward(enemy) {
    // Les récompenses de combat sont permanentes et s'ajoutent aux stats
    let combatBonuses = JSON.parse(localStorage.getItem('combatBonuses') || '{}');
    
    Object.keys(enemy.reward).forEach(stat => {
        combatBonuses[stat] = (combatBonuses[stat] || 0) + enemy.reward[stat];
    });
    
    localStorage.setItem('combatBonuses', JSON.stringify(combatBonuses));
}

function getCombatBonuses() {
    return JSON.parse(localStorage.getItem('combatBonuses') || '{}');
}

function showCombatNotification(enemy) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #ff6b6b, #feca57);
        color: white;
        padding: 30px 50px;
        border-radius: 20px;
        font-size: 1.5em;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        animation: combatWin 0.5s ease-out;
        text-align: center;
    `;
    
    const rewardText = Object.entries(enemy.reward)
        .map(([stat, val]) => `+${val} ${stat.toUpperCase()}`)
        .join(', ');
    
    notification.innerHTML = `
        ⚔️ VICTOIRE ! ⚔️<br>
        <div style="font-size: 0.7em; margin-top: 10px;">
            ${enemy.name} vaincu !<br>
            Récompenses : ${rewardText}
        </div>
    `;
    document.body.appendChild(notification);
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes combatWin {
            0% { transform: translate(-50%, -50%) scale(0) rotate(-180deg); opacity: 0; }
            100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.5s ease-out';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

function displayVictories() {
    const victories = getEnemyVictories();
    const victoryList = document.getElementById('victoryList');
    
    if (Object.keys(victories).length === 0) {
        victoryList.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Aucune victoire pour le moment. Commence à t\'entraîner ! 💪</p>';
        return;
    }
    
    victoryList.innerHTML = '';
    
    martialArtsEnemies.forEach(enemy => {
        const count = victories[enemy.id] || 0;
        if (count > 0) {
            const div = document.createElement('div');
            div.className = 'victory-item';
            
            const rewardText = Object.entries(enemy.reward)
                .map(([stat, val]) => `+${val} ${stat.toUpperCase()}`)
                .join(', ');
            
            div.innerHTML = `
                <span class="victory-name">${enemy.name} x${count}</span>
                <span class="victory-reward">${rewardText} (Total: x${count})</span>
            `;
            victoryList.appendChild(div);
        }
    });
}

// Ajouter l'animation shake
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(shakeStyle); }

/* ========================================
   SYSTÈME DE QUÊTES DAILY RANDOM
======================================== */

const allDailyQuests = [
    // Force & Combat
    { id: 'arts-martiaux', title: '🔥 Entraînement Arts Martiaux 1h', reward: { str: 5, dis: 3 } },
    { id: 'pompes-100', title: '💪 100 Pompes', reward: { str: 4, end: 2 } },
    { id: 'muscu-intense', title: '⚡ Musculation Intense 90min', reward: { str: 7, end: 3 } },
    { id: 'sparring', title: '🥊 Sparring 30min', reward: { str: 6, dis: 4, men: 2 } },
    
    // Endurance
    { id: 'course-10km', title: '🏃 Courir 10km', reward: { end: 6, hp: 3 } },
    { id: 'sprints-10x100m', title: '⚡ 10x100m Sprints Max', reward: { end: 5, str: 3 } },
    { id: 'hiit-45min', title: '🔥 HIIT Intense 45min', reward: { end: 6, hp: 4, str: 2 } },
    
    // Mental & Stratégie
    { id: 'echecs-victoire', title: '♟️ GAGNER 3 Parties d\'Échecs', reward: { men: 5, dis: 3 } },
    { id: 'etude-intense', title: '📚 Étudier 2h', reward: { men: 6, dis: 2 } },
    { id: 'probleme-complexe', title: '🎯 Résoudre Problème Complexe', reward: { men: 7, dis: 3 } },
    { id: 'langue-etrangere', title: '🗣️ Langue Étrangère 1h', reward: { men: 4, dis: 2 } },
    
    // Spirituel
    { id: 'coran-1h', title: '📖 Lire/Mémoriser Coran 1h', reward: { spi: 8, men: 4 } },
    { id: 'tahajjud', title: '🌙 Prière Tahajjud', reward: { spi: 6, dis: 5 } },
    { id: 'jeune-sunnah', title: '🌟 Jeûne Sunnah Aujourd\'hui', reward: { spi: 7, dis: 6, hp: 3 } },
    { id: 'sadaqa', title: '💝 Faire Sadaqa/Charité', reward: { spi: 5, dis: 3 } },
    
    // Santé
    { id: 'jeune-intermittent', title: '⏰ Jeûne Intermittent 16h', reward: { hp: 5, dis: 4 } },
    { id: 'repas-parfait', title: '🥗 3 Repas Parfaits (0 malbouffe)', reward: { hp: 4, str: 2 } },
    { id: 'sauna-glace', title: '🧊 Bain Glacé 5min', reward: { hp: 6, dis: 5, end: 3 } },
    
    // Discipline
    { id: 'reveil-4h', title: '⏰ Se lever à 4h du matin', reward: { dis: 8, men: 5 } },
    { id: 'zero-distraction', title: '📵 0 Réseaux Sociaux Aujourd\'hui', reward: { dis: 7, men: 4 } },
    { id: 'productivite-10h', title: '⚡ 10h Travail/Productivité', reward: { dis: 10, men: 6, end: 3 } },
    { id: 'journee-parfaite', title: '👑 Journée PARFAITE 100%', reward: { str: 5, dis: 15, spi: 5, hp: 5, end: 5, men: 10 } }
];

function initDailyQuests() {
    const today = getTodayDate();
    const savedQuestDate = localStorage.getItem('dailyQuestDate');
    
    if (savedQuestDate !== today) {
        // Nouveau jour : générer 3 nouvelles quêtes aléatoires
        const selectedQuests = selectRandomQuests(3);
        localStorage.setItem('dailyQuests', JSON.stringify(selectedQuests));
        localStorage.setItem('dailyQuestDate', today);
        
        // Réinitialiser les complétions
        selectedQuests.forEach(quest => {
            localStorage.removeItem('dailyQuest_' + quest.id);
        });
    }
    
    displayDailyQuests();
    updateQuestTimer();
}

function selectRandomQuests(count) {
    const shuffled = [...allDailyQuests].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

function displayDailyQuests() {
    const questsList = document.getElementById('dailyQuestsList');
    const dailyQuests = JSON.parse(localStorage.getItem('dailyQuests') || '[]');
    
    if (dailyQuests.length === 0) {
        questsList.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Chargement des quêtes...</p>';
        return;
    }
    
    questsList.innerHTML = '';
    
    dailyQuests.forEach(quest => {
        const isCompleted = localStorage.getItem('dailyQuest_' + quest.id) === 'true';
        
        const questItem = document.createElement('div');
        questItem.className = 'daily-quest-item' + (isCompleted ? ' completed' : '');
        questItem.onclick = () => toggleDailyQuest(quest.id);
        
        const rewardText = Object.entries(quest.reward)
            .map(([stat, val]) => `+${val} ${stat.toUpperCase()}`)
            .join(', ');
        
        questItem.innerHTML = `
            <input type="checkbox" ${isCompleted ? 'checked' : ''} onclick="event.stopPropagation(); toggleDailyQuest('${quest.id}')">
            <div class="daily-quest-content">
                <div class="daily-quest-title">${quest.title}</div>
                <div class="daily-quest-reward">Récompenses : ${rewardText}</div>
            </div>
        `;
        
        questsList.appendChild(questItem);
    });
    
    updateDailyQuestStats();
}

function toggleDailyQuest(questId) {
    const currentState = localStorage.getItem('dailyQuest_' + questId) === 'true';
    const newState = !currentState;
    
    localStorage.setItem('dailyQuest_' + questId, newState);
    
    if (newState) {
        playSound('click');
    }
    
    displayDailyQuests();
    updateStatsDisplay();
}

function updateDailyQuestStats() {
    const dailyQuests = JSON.parse(localStorage.getItem('dailyQuests') || '[]');
    
    let completed = 0;
    let totalBonus = 0;
    
    dailyQuests.forEach(quest => {
        const isCompleted = localStorage.getItem('dailyQuest_' + quest.id) === 'true';
        if (isCompleted) {
            completed++;
            Object.values(quest.reward).forEach(val => {
                totalBonus += val;
            });
        }
    });
    
    document.getElementById('dailyQuestsCompleted').textContent = `${completed}/${dailyQuests.length}`;
    document.getElementById('dailyQuestBonus').textContent = `+${totalBonus}`;
}

function getDailyQuestBonuses() {
    const bonuses = {
        str: 0,
        dis: 0,
        spi: 0,
        hp: 0,
        end: 0,
        men: 0
    };
    
    const dailyQuests = JSON.parse(localStorage.getItem('dailyQuests') || '[]');
    
    dailyQuests.forEach(quest => {
        const isCompleted = localStorage.getItem('dailyQuest_' + quest.id) === 'true';
        if (isCompleted) {
            Object.keys(quest.reward).forEach(stat => {
                bonuses[stat] += quest.reward[stat];
            });
        }
    });
    
    return bonuses;
}

function updateQuestTimer() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow - now;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    const timerElement = document.getElementById('questTimer');
    if (timerElement) {
        timerElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

// Mettre à jour le timer toutes les secondes
setInterval(updateQuestTimer, 1000);

/* ========================================
   INITIALISATION COMPLÈTE
======================================== */

function initializeApp() {
    console.log('🚀 Initialisation de l\'application RPG Tracker...');
    
    // Charger les préférences
    loadTheme();
    loadSoundPreference();
    
    // Initialiser les systèmes
    updateDate();
    initRankSystem();
    loadState();
    updateRankSystem();
    updateStreaks();
    updateStatsDisplay();
    initCombatSystem();
    initDailyQuests();
    
    console.log('✅ Application initialisée avec succès !');
    console.log('📊 Historique : 90 derniers jours');
    console.log('🏆 Système de rang : Actif');
    console.log('📈 Système de stats : Actif');
    console.log('🔥 Système de streaks : Actif');
    console.log('⚔️ Système de combat : Actif');
    console.log('🎲 Quêtes quotidiennes : Actives');
    console.log('🌙 Mode sombre/clair : Disponible');
    console.log('🔊 Sons : ' + (soundEnabled ? 'Activés' : 'Désactivés'));
}

// Vérifier le changement de jour et mettre à jour toutes les 60 secondes
setInterval(() => {
    checkDayChange();
    updateRankSystem();
    updateStatsDisplay();
    updateStreaks();
}, 60000);

// Vérifier aussi quand la page redevient visible
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        checkDayChange();
        updateRankSystem();
        updateStatsDisplay();
        updateStreaks();
        initCombatSystem();
        initDailyQuests();
    }
});

// Redessiner le graphique lors du redimensionnement
window.addEventListener('resize', function() {
    updateStatsDisplay();
});

// Démarrer l'application quand le DOM est chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

/* ========================================
   FONCTIONS UTILITAIRES SUPPLÉMENTAIRES
======================================== */

// Fonction pour obtenir les bonus de streak dans les stats
function getStreakBonusForDisplay() {
    const currentStreak = parseInt(localStorage.getItem('currentStreak') || '0');
    const bonuses = getStreakBonus(currentStreak);
    
    // Ajouter les bonus de streak aux stats affichées
    return bonuses;
}

// Intégrer les bonus de streak dans le calcul des stats
function calculateStatsWithAllBonuses() {
    const baseStats = calculateStats();
    const questBonuses = getDailyQuestBonuses();
    const combatBonuses = getCombatBonuses();
    const streakBonuses = getStreakBonusForDisplay();
    
    const finalStats = { ...baseStats };
    
    // Ajouter tous les bonus
    ['str', 'dis', 'spi', 'hp', 'end', 'men'].forEach(stat => {
        finalStats[stat] += (questBonuses[stat] || 0);
        finalStats[stat] += (combatBonuses[stat] || 0);
        finalStats[stat] += (streakBonuses[stat] || 0);
    });
    
    return finalStats;
}

/* ========================================
   EXPORT/UTILITAIRES DE DEBUG
======================================== */

// Fonction pour exporter les données (utile pour backup)
function exportData() {
    const data = {
        habits: {},
        habitHistory: localStorage.getItem('habitHistory'),
        rankProgressPoints: localStorage.getItem('rankProgressPoints'),
        currentRankIndex: localStorage.getItem('currentRankIndex'),
        rankHistory: localStorage.getItem('rankHistory'),
        currentStreak: localStorage.getItem('currentStreak'),
        bestStreak: localStorage.getItem('bestStreak'),
        enemyVictories: localStorage.getItem('enemyVictories'),
        combatBonuses: localStorage.getItem('combatBonuses'),
        dailyQuests: localStorage.getItem('dailyQuests'),
        theme: localStorage.getItem('theme'),
        soundEnabled: localStorage.getItem('soundEnabled')
    };
    
    // Récupérer l'état actuel des habitudes
    habits.forEach(habit => {
        data.habits[habit] = localStorage.getItem(habit);
    });
    
    console.log('📦 Données exportées :', data);
    return JSON.stringify(data);
}

// Fonction pour importer les données
function importData(jsonData) {
    try {
        const data = JSON.parse(jsonData);
        
        // Restaurer toutes les données
        Object.keys(data).forEach(key => {
            if (key === 'habits') {
                Object.keys(data.habits).forEach(habit => {
                    if (data.habits[habit] !== null) {
                        localStorage.setItem(habit, data.habits[habit]);
                    }
                });
            } else if (data[key] !== null && data[key] !== undefined) {
                localStorage.setItem(key, data[key]);
            }
        });
        
        console.log('✅ Données importées avec succès !');
        location.reload();
    } catch (e) {
        console.error('❌ Erreur lors de l\'import :', e);
    }
}

// Exposer certaines fonctions globalement pour le debug
window.RPGTracker = {
    exportData,
    importData,
    resetAllData: () => {
        if (confirm('⚠️ ATTENTION : Cela va supprimer TOUTES tes données ! Es-tu sûr ?')) {
            localStorage.clear();
            location.reload();
        }
    },
    getStats: calculateStatsWithAllBonuses,
    getPowerLevel: updateStatsDisplay
};

console.log('💡 Astuce : Utilise window.RPGTracker pour accéder aux fonctions de debug');
console.log('   - RPGTracker.exportData() : Exporter tes données');
console.log('   - RPGTracker.importData(json) : Importer des données');
console.log('   - RPGTracker.getStats() : Voir tes stats complètes');
console.log('   - RPGTracker.getPowerLevel() : Voir ton Power Level');
