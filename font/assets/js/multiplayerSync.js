class MultiplayerSync {
  constructor() {
    // The WebSocket connection
    this.socket = null;
    
    // Player ID assigned by server
    this.playerId = null;
    
    // Other players in the game
    this.otherPlayers = {};
    
    // Game state from server
    this.serverGameState = null;
    
    // Callbacks
    this.onInitCallback = null;
    this.onPlayerJoinCallback = null;
    this.onPlayerLeaveCallback = null;
    this.onGameStateUpdateCallback = null;
  }
  
  connect() {
    // Determine the WebSocket URL (adjust if using a different host)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    this.socket = new WebSocket(wsUrl);
    
    this.socket.onopen = () => {
      console.log('Connected to game server');
    };
    
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleServerMessage(data);
      } catch (error) {
        console.error('Error parsing server message:', error);
      }
    };
    
    this.socket.onclose = () => {
      console.log('Disconnected from game server');
    };
    
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }
  
  handleServerMessage(data) {
    switch (data.type) {
      case 'init':
        this.playerId = data.id;
        this.serverGameState = data.gameState;
        
        // Extract other players
        this.updateOtherPlayers();
        
        if (this.onInitCallback) {
          this.onInitCallback(data);
        }
        break;
        
      case 'gameState':
        this.serverGameState = data.gameState;
        
        // Update other players
        this.updateOtherPlayers();
        
        if (this.onGameStateUpdateCallback) {
          this.onGameStateUpdateCallback(data.gameState);
        }
        break;
    }
  }
  
  updateOtherPlayers() {
    const newOtherPlayers = {};
    
    // Filter out current player and create updated other players object
    for (const id in this.serverGameState.players) {
      if (id != this.playerId) {
        newOtherPlayers[id] = this.serverGameState.players[id];
      }
    }
    
    // Check for new players
    for (const id in newOtherPlayers) {
      if (!this.otherPlayers[id] && this.onPlayerJoinCallback) {
        this.onPlayerJoinCallback(newOtherPlayers[id]);
      }
    }
    
    // Check for players who left
    for (const id in this.otherPlayers) {
      if (!newOtherPlayers[id] && this.onPlayerLeaveCallback) {
        this.onPlayerLeaveCallback(this.otherPlayers[id]);
      }
    }
    
    // Update other players
    this.otherPlayers = newOtherPlayers;
  }
  
  // Send player update to server
  sendPlayerUpdate(player) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'playerUpdate',
        x: player.x,
        y: player.y,
        health: player.health,
        inventory: player.inventory.getWeapons().map(weapon => [
          weapon.maxHealth,
          weapon.regeneration,
          weapon.strength,
          weapon.attack,
          weapon.range,
          weapon.speed,
          weapon.luck,
          weapon.sprite?.src || null
        ])
      }));
    }
  }
  
  // Send bullet creation to server
  sendBulletCreation(x, y, angle, speed, damage) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'shoot',
        x: x,
        y: y,
        angle: angle,
        speed: speed,
        damage: damage
      }));
    }
  }
  
  // Send coin collection to server
  sendCoinCollected(coinId) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'coinCollected',
        coinId: coinId
      }));
    }
  }
  
  // Register event callbacks
  onInit(callback) {
    this.onInitCallback = callback;
  }
  
  onPlayerJoin(callback) {
    this.onPlayerJoinCallback = callback;
  }
  
  onPlayerLeave(callback) {
    this.onPlayerLeaveCallback = callback;
  }
  
  onGameStateUpdate(callback) {
    this.onGameStateUpdateCallback = callback;
  }
  
  // Get server game state
  getGameState() {
    return this.serverGameState;
  }
  
  // Get other players
  getOtherPlayers() {
    return this.otherPlayers;
  }
  
  // Get player ID
  getPlayerId() {
    return this.playerId;
  }
}