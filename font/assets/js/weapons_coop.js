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