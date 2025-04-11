document.addEventListener('DOMContentLoaded', function() {
    // Variables pour stocker les sélections
    let selectedWeapon = null;
    let selectedCharacter = null;
    let socket = null;
    let roomId = null;
    let isHost = false;
    let playerId = null;
    let teamMembers = {};
    let isPlayerReady = false;
    
    // Fonction pour vérifier si les deux sélections sont faites
    function checkSelections() {
        const playButton = document.getElementById('playButton');
        
        // Ajouter des logs pour déboguer
        console.log("Sélections:", {
            weapon: selectedWeapon ? true : false,
            character: selectedCharacter ? true : false,
            roomId: roomId
        });
        
        if (selectedWeapon && selectedCharacter && roomId) {
            console.log("Conditions remplies, activation du bouton");
            playButton.removeAttribute('disabled');
            playButton.style.opacity = "1";
            playButton.textContent = isHost ? 'START GAME' : 'READY';
            
            // Envoyer les informations du joueur au serveur
            updatePlayerSelection();
        } else {
            console.log("Conditions non remplies, bouton désactivé");
            playButton.setAttribute('disabled', 'disabled');
            playButton.style.opacity = "0.6";
            
            if (!roomId) {
                playButton.textContent = 'WAITING FOR CONNECTION';
            } else if (!selectedWeapon || !selectedCharacter) {
                playButton.textContent = 'SELECT WEAPON AND CHARACTER';
            }
        }
        
        // Si c'est l'hôte, vérifier aussi si tous les joueurs sont prêts
        if (isHost && roomId) {
            checkAllPlayersReady();
        }
    }
    
    // Fonction pour mettre à jour l'interface de l'équipe
    function updateTeamDisplay() {
        const teamContainer = document.getElementById('team-members');
        teamContainer.innerHTML = '';
        
        Object.values(teamMembers).forEach(member => {
            const memberElement = document.createElement('div');
            memberElement.className = 'team-member';
            if (member.id === playerId) {
                memberElement.classList.add('current-player');
            }
            
            let statusClass = '';
            let statusText = '';
            
            if (member.isHost) {
                statusClass = 'host';
                statusText = 'HOST';
            }
            if (member.isReady) {
                statusClass = 'ready';
                statusText = 'READY';
            }
            
            memberElement.innerHTML = `
                <div class="member-avatar">
                    ${member.sprite ? `<img src="${member.sprite}" alt="Player">` : '<div class="no-selection">?</div>'}
                </div>
                <div class="member-info">
                    <div class="member-name">Player ${member.id.substr(0, 4)}</div>
                    <div class="member-status ${statusClass}">${statusText}</div>
                </div>
            `;
            
            teamContainer.appendChild(memberElement);
        });
    }
    
    // Fonction pour envoyer les informations de sélection au serveur
    function updatePlayerSelection() {
        if (socket && roomId && selectedCharacter) {
            const playerData = {
                id: playerId,
                isHost: isHost,
                isReady: isPlayerReady,
                sprite: selectedCharacter.querySelector('img').src
            };
            
            // Envoyer la mise à jour au serveur
            socket.emit('player-selection-update', { roomId, playerData });
            
            // Mettre à jour localement
            if (teamMembers[playerId]) {
                teamMembers[playerId].sprite = playerData.sprite;
                updateTeamDisplay();
            }
        }
    }
    
    // Connexion WebSocket
    function initSocket() {
        // Connecter au serveur
        socket = io('http://localhost:3000');
        
        // Événements socket
        socket.on('connect', () => {
            console.log('Connected to server');
            playerId = socket.id;
        });
        
        socket.on('room-created', (data) => {
            roomId = data.roomId;
            isHost = true;
            document.getElementById('roomCode').textContent = roomId;
            document.getElementById('roomCodeDisplay').style.display = 'block';
            document.getElementById('waiting-message').style.display = 'block';
            
            // Initialiser la liste des membres de l'équipe
            teamMembers = {
                [playerId]: {
                    id: playerId,
                    isHost: true,
                    isReady: false,
                    sprite: null
                }
            };
            
            updateTeamDisplay();
            checkSelections();
        });
        
        socket.on('room-joined', (data) => {
            roomId = data.roomId;
            isHost = false;
            document.getElementById('joinStatus').textContent = 'Joined room successfully!';
            document.getElementById('joinStatus').style.color = 'green';
            
            // Initialiser la liste des membres de l'équipe
            teamMembers = data.players || {};
            
            // Ajouter ce joueur si non présent
            if (!teamMembers[playerId]) {
                teamMembers[playerId] = {
                    id: playerId,
                    isHost: false,
                    isReady: false,
                    sprite: null
                };
            }
            
            updateTeamDisplay();
            checkSelections();
        });
        
        socket.on('room-join-error', (data) => {
            document.getElementById('joinStatus').textContent = data.message;
            document.getElementById('joinStatus').style.color = 'red';
        });
        
        socket.on('player-joined', (data) => {
            // Mettre à jour la liste des joueurs avec le nouveau joueur
            if (data.player) {
                teamMembers[data.player.id] = data.player;
                updateTeamDisplay();
            }
            
            if (isHost) {
                document.getElementById('waiting-message').textContent = 'Player joined! Ready to start.';
            }
        });
        
        // Événement pour mettre à jour les sélections de joueurs
        socket.on('player-selection-updated', (data) => {
            if (data.playerData && teamMembers[data.playerData.id]) {
                teamMembers[data.playerData.id] = {
                    ...teamMembers[data.playerData.id],
                    ...data.playerData
                };
                updateTeamDisplay();
                
                // Si vous êtes l'hôte, vérifiez si tous les joueurs sont prêts
                if (isHost) {
                    checkAllPlayersReady();
                }
            }
        });
        
        // Événement quand un joueur devient prêt
        socket.on('player-ready', (data) => {
            if (data.playerId && teamMembers[data.playerId]) {
                teamMembers[data.playerId].isReady = true;
                updateTeamDisplay();
                
                // Si vous êtes l'hôte, vérifiez si tous les joueurs sont prêts
                if (isHost) {
                    checkAllPlayersReady();
                }
            }
        });
        
        // Événement pour le lancement du jeu
        socket.on('start-game', (data) => {
            // Le host a démarré la partie, rediriger vers la page de jeu
            localStorage.setItem('roomId', roomId);
            localStorage.setItem('isHost', isHost);
            localStorage.setItem('waveIndex', '0'); // Commencer à la vague 0
            
            // Préparer les données du joueur pour la partie
            preparePlayerData();
            
            // Rediriger vers la page de jeu multijoueur
            window.location.href = 'multi-game.html';
        });
    }
    
    // Fonction pour vérifier si tous les joueurs sont prêts
    function checkAllPlayersReady() {
        if (!isHost) return;
        
        const allPlayers = Object.values(teamMembers);
        // Ignorer l'hôte dans la vérification "ready"
        const nonHostPlayers = allPlayers.filter(player => !player.isHost);
        const allReady = nonHostPlayers.every(player => player.isReady);
        
        // Mettre à jour le bouton de l'hôte
        const playButton = document.getElementById('playButton');
        if (allReady && selectedWeapon && selectedCharacter) {
            playButton.removeAttribute('disabled');
            playButton.textContent = 'START GAME';
        } else if (selectedWeapon && selectedCharacter) {
            playButton.removeAttribute('disabled');
            playButton.textContent = 'WAITING FOR PLAYERS';
        }
    }
    
    // Fonction pour préparer les données du joueur
    function preparePlayerData() {
        if (selectedWeapon && selectedCharacter) {
            // Préparer les données du joueur
            const charStats = JSON.parse(selectedCharacter.getAttribute('data-char'));
            const weaponStats = JSON.parse(selectedWeapon.getAttribute('data-char'));
            const totalStats = weaponStats.map((stat, index) => stat + charStats[index]);
            
            // Stocker les données dans localStorage
            localStorage.setItem('selectedCharacter', selectedCharacter.getAttribute('data-char'));
            const weaponImage = selectedWeapon.querySelector('img').src;
            const inventory = [[...weaponStats, weaponImage]];
            localStorage.setItem('inventory', JSON.stringify(inventory));
            localStorage.setItem('playerSprite', selectedCharacter.querySelector('img').src);
            localStorage.setItem('playerStats', JSON.stringify(totalStats));
        }
    }
    
    // Initialiser la connexion socket
    initSocket();
    
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
    
    // Bouton pour créer une salle
    document.getElementById('createRoomBtn').addEventListener('click', function() {
        if (socket) {
            socket.emit('create-room');
        }
    });
    
    // Bouton pour rejoindre une salle
    document.getElementById('joinRoomBtn').addEventListener('click', function() {
        const code = document.getElementById('joinRoomCode').value.trim();
        if (code && socket) {
            socket.emit('join-room', { roomId: code });
        } else {
            document.getElementById('joinStatus').textContent = 'Please enter a valid room code';
            document.getElementById('joinStatus').style.color = 'red';
        }
    });
    
    // Bouton de jeu
    document.getElementById('playButton').addEventListener('click', function() {
        if (selectedWeapon && selectedCharacter && roomId) {
            // Préparer les données du joueur
            preparePlayerData();
            
            if (isHost) {
                // L'hôte démarre la partie
                socket.emit('start-game', { roomId });
            } else {
                // Le joueur qui rejoint signale qu'il est prêt
                isPlayerReady = true;
                socket.emit('player-ready', { 
                    roomId,
                    playerId
                });
                
                // Mettre à jour l'état local
                if (teamMembers[playerId]) {
                    teamMembers[playerId].isReady = true;
                    updateTeamDisplay();
                }
                
                // Désactiver le bouton après avoir cliqué sur READY
                this.disabled = true;
                this.textContent = "WAITING FOR HOST";
            }
        }
    });
});