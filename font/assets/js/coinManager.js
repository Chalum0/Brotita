class CoinManager {
    constructor() {
      this.coins = [];
    }
  
    drawCoins(ctx) {
      this.coins.forEach(coin => {
        coin.draw(ctx);
      });
    }
  
    spawnCoin(x, y, waveIndex) {
      // Plus la vague est élevée, plus la pièce peut avoir de valeur
      const maxValue = Math.max(1, Math.floor(waveIndex / 2) + 1);
      const value = Math.floor(Math.random() * maxValue) + 1;
      this.coins.push(new Coin(x, y, value));
      console.log("Coin spawned at", x, y, "with value", value); // Debug
    }
  
    checkCollisions(player) {
      for (let i = this.coins.length - 1; i >= 0; i--) {
        if (this.coins[i].collidesWith(player)) {
          // Ajouter la valeur de la pièce au total
          totalCoins += this.coins[i].value;
          console.log("Coin collected! Total coins:", totalCoins); // Debug
          
          // Supprimer la pièce
          this.coins.splice(i, 1);
        }
      }
    }
  }