let timerInterval = setInterval(() => {
    if (timer > 0) {
        document.querySelector('.i-wave').innerHTML = waveIndex;
        timer--;
        document.querySelector('.timer').innerHTML = timer;
    } else if (!waveCompleted && player.isAlive()) {
        // Marquer la vague comme complétée
        waveCompleted = true;
        
        // Arrêter le spawn de nouveaux ennemis
        clearInterval(enemySpawnInterval);
        
        // Commencer le despawn progressif des ennemis
        startEnemyDespawn();
    }
}, 1000);

function startEnemyDespawn() {
    // Intervalle pour faire disparaître un ennemi toutes les 300ms
    enemyDespawnInterval = setInterval(() => {
        if (enemies.getEnemies().length > 0) {
            // Supprimer le premier ennemi de la liste
            enemies.despawnOneEnemy();
        } else {
            // Tous les ennemis ont disparu, afficher le modal de victoire
            clearInterval(enemyDespawnInterval);
            if (!isVictoryModalShown) {
                isVictoryModalShown = true;
                document.getElementById('coinsCollected').textContent = totalCoins;
                showVictoryModal();
            }
        }
    }, 300);
}

// Fonctions pour les modaux
function showVictoryModal() {
    document.getElementById('victoryModal').style.display = 'flex';
    document.getElementById('waveReached').textContent = waveIndex;
    
    // Afficher le nombre de pièces collectées pendant cette vague
    document.getElementById('coinsCollected').textContent = totalCoins - parseInt(localStorage.getItem('playerCoins') || 0);
    
    // Sauvegarder le nombre TOTAL de pièces pour le shop
    localStorage.setItem('playerCoins', totalCoins);
}

function showDefeatModal() {
    document.getElementById('defeatModal').style.display = 'flex';
    document.getElementById('waveReached').textContent = waveIndex;
}

// Boutons des modaux
document.getElementById('shopButton').addEventListener('click', function() {
    window.location.href = "./shop.html";
});

document.getElementById('restartButton').addEventListener('click', function() {
    window.location.href = "./solo.html";
});

document.getElementById('menuButton').addEventListener('click', function() {
    window.location.href = "./home.html";
});