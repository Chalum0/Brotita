const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Servir les fichiers statiques depuis le dossier parent
app.use(express.static(path.join(__dirname, '../')));

// Stockage des salles et états de jeu
const rooms = {};
const gameStates = {};

io.on('connection', (socket) => {
  console.log('Un utilisateur s\'est connecté:', socket.id);

  // Créer une salle
  socket.on('create-room', () => {
    const roomId = generateRoomId();
    
    rooms[roomId] = {
      host: socket.id,
      players: {
        [socket.id]: {
          id: socket.id,
          isHost: true,
          isReady: false,
          spriteId: 0, // Ajout de spriteId par défaut
          x: 0, 
          y: 0,
          health: 100,
          coins: 0,
          weapons: []
        }
      }
    };
    
    socket.join(roomId);
    socket.emit('room-created', { 
      roomId, 
      playerId: socket.id,
      players: rooms[roomId].players
    });
    
    console.log(`Salle créée: ${roomId} par ${socket.id}`);
  });
  
  // Rejoindre une salle
  socket.on('join-room', ({roomId, spriteId = 0}) => {
    if (!rooms[roomId]) {
      socket.emit('room-join-error', { message: 'Cette salle n\'existe pas' });
      return;
    }
    
    rooms[roomId].players[socket.id] = {
      id: socket.id,
      isHost: false,
      isReady: false,
      spriteId: spriteId, // Utiliser le spriteId fourni
      x: 0,
      y: 0,
      health: 100,
      coins: 0,
      weapons: []
    };
    
    socket.join(roomId);
    
    socket.emit('room-joined', { 
      roomId, 
      playerId: socket.id,
      players: rooms[roomId].players
    });
    
    socket.to(roomId).emit('player-joined', { 
      player: rooms[roomId].players[socket.id]
    });
    
    console.log(`${socket.id} a rejoint la salle ${roomId} avec sprite ${spriteId}`);
    
    // Envoyer immédiatement l'état du jeu à tous les joueurs
    if (gameStates[roomId]) {
      broadcastGameState(roomId);
    }
  });
  
  // Demande d'état du jeu
  socket.on('request-game-state', ({roomId}) => {
    if (!rooms[roomId]) {
      socket.emit('room-join-error', { message: 'Cette salle n\'existe pas' });
      return;
    }
    
    // Envoyer l'état complet du jeu au joueur qui le demande
    socket.emit('game-state', {
      players: rooms[roomId].players,
      enemies: gameStates[roomId]?.enemies || [],
      coins: gameStates[roomId]?.coins || [],
      trees: gameStates[roomId]?.trees || [],
      wave: gameStates[roomId]?.wave || 0,
      timer: gameStates[roomId]?.timer || 30
    });
    
    console.log(`État du jeu envoyé à ${socket.id} pour la salle ${roomId}`);
  });
  
  // Mise à jour de la sélection du joueur
  socket.on('player-selection-update', ({roomId, playerData}) => {
    if (!rooms[roomId] || !rooms[roomId].players[socket.id]) return;
    
    rooms[roomId].players[socket.id] = {
      ...rooms[roomId].players[socket.id],
      ...playerData
    };
    
    socket.to(roomId).emit('player-selection-updated', { playerData });
    console.log(`${socket.id} a mis à jour sa sélection dans ${roomId}`);
  });
  
  // Joueur prêt
  socket.on('player-ready', ({roomId, playerId}) => {
    if (!rooms[roomId] || !rooms[roomId].players[playerId]) return;
    
    rooms[roomId].players[playerId].isReady = true;
    io.to(roomId).emit('player-ready', { playerId });
    
    console.log(`${playerId} est prêt dans ${roomId}`);
  });
  
  // Démarrer la partie
  socket.on('start-game', ({roomId}) => {
    if (!rooms[roomId] || rooms[roomId].host !== socket.id) return;
    
    gameStates[roomId] = {
      wave: 0,
      enemies: [],
      coins: [],
      trees: [],
      waveCompleted: false,
      timer: 30,
      players: rooms[roomId].players
    };
    
    io.to(roomId).emit('start-game', { roomId });
    console.log(`Partie démarrée dans ${roomId} par ${socket.id}`);
    
    // Envoyer l'état initial du jeu à tous les joueurs
    broadcastGameState(roomId);
    
    startWaveTimer(roomId);
  });
  
  // Mise à jour des positions des joueurs
  socket.on('player-update', ({roomId, x, y, health, weapons, spriteId}) => {
    if (!rooms[roomId] || !rooms[roomId].players[socket.id]) return;
    
    const player = rooms[roomId].players[socket.id];
    player.x = x;
    player.y = y;
    player.health = health;
    player.weapons = weapons || player.weapons;
    
    // Mettre à jour le spriteId si fourni
    if (spriteId !== undefined) {
      player.spriteId = spriteId;
    }
    
    // Envoyer les mises à jour aux autres joueurs avec TOUTES les propriétés
    socket.to(roomId).emit('player-position', { 
      id: socket.id,
      x, 
      y,
      health,
      weapons,
      spriteId: player.spriteId
    });
  });
  
  // Ajout d'un ennemi
  socket.on('enemy-spawn', ({roomId, enemy}) => {
    if (!rooms[roomId] || !gameStates[roomId]) return;
    
    const enemyId = `enemy-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    enemy.id = enemyId;
    gameStates[roomId].enemies.push(enemy);
    
    io.to(roomId).emit('enemy-spawned', { enemy });
  });
  
  // Mise à jour des ennemis
  socket.on('enemy-update', ({roomId, enemyId, x, y, health}) => {
    if (!rooms[roomId] || !gameStates[roomId]) return;
    
    const enemy = gameStates[roomId].enemies.find(e => e.id === enemyId);
    if (enemy) {
      enemy.x = x;
      enemy.y = y;
      enemy.health = health;
      
      socket.to(roomId).emit('enemy-updated', { enemyId, x, y, health });
    }
  });
  
  // Mort d'un ennemi
  socket.on('enemy-killed', ({roomId, enemyId, dropCoin, coinValue, x, y}) => {
    if (!rooms[roomId] || !gameStates[roomId]) return;
    
    gameStates[roomId].enemies = gameStates[roomId].enemies.filter(e => e.id !== enemyId);
    
    if (dropCoin) {
      const coinId = `coin-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      gameStates[roomId].coins.push({
        id: coinId,
        x,
        y,
        value: coinValue
      });
      
      io.to(roomId).emit('coin-spawned', { 
        id: coinId, 
        x, 
        y, 
        value: coinValue 
      });
    }
    
    io.to(roomId).emit('enemy-died', { enemyId });
  });
  
  // Collecte d'une pièce
  socket.on('coin-collected', ({roomId, coinId}) => {
    if (!rooms[roomId] || !gameStates[roomId]) return;
    
    const coin = gameStates[roomId].coins.find(c => c.id === coinId);
    if (coin) {
      rooms[roomId].players[socket.id].coins += coin.value;
      gameStates[roomId].coins = gameStates[roomId].coins.filter(c => c.id !== coinId);
      
      io.to(roomId).emit('coin-collected', { 
        coinId, 
        playerId: socket.id,
        totalCoins: rooms[roomId].players[socket.id].coins
      });
    }
  });
  
  // Tir d'une balle
  socket.on('bullet-fired', ({roomId, bullet}) => {
    if (!rooms[roomId]) return;
    
    bullet.id = `bullet-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    bullet.playerId = socket.id;
    
    // Envoyer à TOUS les joueurs, y compris l'émetteur
    io.to(roomId).emit('bullet-fired', { bullet });
  });
  
  // Impact de balle
  socket.on('bullet-hit', ({roomId, bulletId, enemyId, damage}) => {
    if (!rooms[roomId] || !gameStates[roomId]) return;
    
    // Envoyer à TOUS les joueurs
    io.to(roomId).emit('bullet-hit', { bulletId, enemyId, damage });
  });
  
  // Achat d'item dans le shop
  socket.on('item-purchased', ({roomId, itemId, itemType, stats, price}) => {
    if (!rooms[roomId] || !rooms[roomId].players[socket.id]) return;
    
    const player = rooms[roomId].players[socket.id];
    
    if (player.coins >= price) {
      player.coins -= price;
      
      io.to(roomId).emit('item-purchased', { 
        playerId: socket.id,
        itemId,
        itemType,
        stats,
        remainingCoins: player.coins
      });
    }
  });
  
  // Continuation vers la vague suivante
  socket.on('next-wave', ({roomId}) => {
    if (!rooms[roomId] || rooms[roomId].host !== socket.id || !gameStates[roomId]) return;
    
    gameStates[roomId].wave++;
    gameStates[roomId].enemies = [];
    gameStates[roomId].waveCompleted = false;
    gameStates[roomId].timer = 30;
    
    io.to(roomId).emit('wave-started', { 
      wave: gameStates[roomId].wave,
      timer: gameStates[roomId].timer
    });
    
    console.log(`Vague ${gameStates[roomId].wave} démarrée dans ${roomId}`);
    startWaveTimer(roomId);
  });
  
  // Déconnexion d'un joueur
  socket.on('disconnect', () => {
    console.log('Utilisateur déconnecté:', socket.id);
    
    for (const roomId in rooms) {
      if (rooms[roomId].players[socket.id]) {
        const isHost = rooms[roomId].host === socket.id;
        
        delete rooms[roomId].players[socket.id];
        
        if (isHost) {
          io.to(roomId).emit('room-closed', { message: 'L\'hôte a quitté la partie' });
          
          delete rooms[roomId];
          if (gameStates[roomId]) {
            delete gameStates[roomId];
          }
        } else {
          io.to(roomId).emit('player-left', { playerId: socket.id });
        }
        
        break;
      }
    }
  });
});

// Fonction pour envoyer l'état complet du jeu à tous les joueurs d'une salle
function broadcastGameState(roomId) {
  if (!rooms[roomId]) return;
  
  io.to(roomId).emit('game-state', {
    players: rooms[roomId].players,
    enemies: gameStates[roomId]?.enemies || [],
    coins: gameStates[roomId]?.coins || [],
    trees: gameStates[roomId]?.trees || [],
    wave: gameStates[roomId]?.wave || 0,
    timer: gameStates[roomId]?.timer || 30
  });
  
  console.log(`État du jeu diffusé à tous les joueurs de la salle ${roomId}`);
}

// Fonction pour générer un ID de salle aléatoire
function generateRoomId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Fonction pour gérer le timer des vagues
function startWaveTimer(roomId) {
  if (!gameStates[roomId]) return;
  
  const timerInterval = setInterval(() => {
    if (!gameStates[roomId]) {
      clearInterval(timerInterval);
      return;
    }
    
    if (gameStates[roomId].timer > 0) {
      gameStates[roomId].timer--;
      
      // Envoyer la mise à jour du timer
      io.to(roomId).emit('timer-update', { 
        timer: gameStates[roomId].timer 
      });
      
      // Envoyer l'état du jeu périodiquement (toutes les 5 secondes)
      if (gameStates[roomId].timer % 5 === 0) {
        broadcastGameState(roomId);
      }
    } else if (!gameStates[roomId].waveCompleted) {
      gameStates[roomId].waveCompleted = true;
      
      io.to(roomId).emit('wave-completed', { 
        wave: gameStates[roomId].wave,
        nextAction: 'shop'
      });
      
      clearInterval(timerInterval);
    }
  }, 1000);
}

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});