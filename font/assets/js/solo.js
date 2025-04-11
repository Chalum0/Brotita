document.addEventListener('DOMContentLoaded', function() {
    // Variables pour stocker les sélections
    let selectedWeapon = null;
    let selectedCharacter = null;
    
    // Fonction pour vérifier si les deux sélections sont faites
    function checkSelections() {
        const playButton = document.getElementById('playButton');
        if (selectedWeapon && selectedCharacter) {
            playButton.style.display = 'block';
        } else {
            playButton.style.display = 'none';
        }
    }
    
    // Gestion des sélections d'armes
    const weaponItems = document.querySelectorAll('.weapons .items');
    weaponItems.forEach(weapon => {
        weapon.addEventListener('click', function() {
            if (this.classList.contains('selected')) {
            // Si l'élément est déjà sélectionné, retirer la sélection
            this.classList.remove('selected');
            selectedWeapon = null;
            } else {
            // Sinon, retirer la sélection précédente et sélectionner l'élément actuel
            weaponItems.forEach(w => w.classList.remove('selected'));
            this.classList.add('selected');
            selectedWeapon = this;
            }
            checkSelections();
        });
    });
    
    // Gestion des sélections de personnages
    const characterItems = document.querySelectorAll('.characters .items');
    characterItems.forEach(character => {
        character.addEventListener('click', function() {
            if (this.classList.contains('selected')) {
                // Si l'élément est déjà sélectionné, retirer la sélection
                this.classList.remove('selected');
                selectedCharacter = null;
            } else {
                // Sinon, retirer la sélection précédente et sélectionner l'élément actuel
                characterItems.forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
                selectedCharacter = this;
            }
            checkSelections();
        });
    });
    
    document.getElementById('playButton').addEventListener('click', function() {
    // Vérifier que les sélections sont faites
    if (selectedWeapon && selectedCharacter) {
        // Stocker les données du personnage
        localStorage.clear();
        localStorage.setItem('selectedCharacter', selectedCharacter.getAttribute('data-char'));
        
        // Get weapon stats and image
        const weaponStats = JSON.parse(selectedWeapon.getAttribute('data-char'));
        const weaponImage = selectedWeapon.querySelector('img').src;
        
        // Create inventory with selected weapon (including image)
        const inventory = [
            [...weaponStats, weaponImage]
        ];
        
        // Stocker l'inventaire dans localStorage
        localStorage.setItem('inventory', JSON.stringify(inventory));
        localStorage.setItem('playerSprite', selectedCharacter.querySelector('img').src);
        
        // Calculer et stocker les stats totales
        const charStats = JSON.parse(selectedCharacter.getAttribute('data-char'));
        const totalStats = weaponStats.map((stat, index) => stat + charStats[index]);
        localStorage.setItem('playerStats', JSON.stringify(totalStats));
        
        // Rediriger vers la page de jeu
        window.location.href = 'game.html';
    }
});
});
        let weaponsStats = [0, 0, 0, 0, 0, 0, 0];
        let charStats = [0, 0, 0, 0, 0, 0, 0];
        let stats = [0, 0, 0, 0, 0, 0, 0];

        function updateStats(){
            // Récupérer les stats de l'arme et du personnage
            const weapon = weaponsStats.map(Number);
            const char = charStats.map(Number);
            // Calculer les stats totales
            const totalStats = weapon.map((stat, index) => stat + char[index]);
            // Mettre à jour les éléments de stats dans le DOM
            const statElements = document.querySelectorAll('.stats .stat p');
            statElements.forEach((element, index) => {
                element.textContent = totalStats[index];
            });
        }

        function updateStatsWeapons(element) {
            // Récupérer les stats de l'arme sélectionnée
            const stats = JSON.parse(element.getAttribute('data-char'));
            weaponsStats = stats;
            updateStats();
        }

        function updateStatsChar(element) {
            // Récupérer les stats du personnage sélectionné
            const stats = JSON.parse(element.getAttribute('data-char'));
            charStats = stats; 
            updateStats();
        }