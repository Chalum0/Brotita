document.addEventListener('DOMContentLoaded', function() {
    // Player selection handling
    let currentPlayer = 1;
    let player1Button = document.getElementById('player1Button');
    let player2Button = document.getElementById('player2Button');
    
    // Get shared game information
    let waveNumber = parseInt(localStorage.getItem('waveIndex') || 0) + 1;
    
    // Player 1 data
    let player1Coins = parseInt(localStorage.getItem('player1Coins') || 0);
    let player1Stats = JSON.parse(localStorage.getItem('player1Stats') || '[100,5,1,1,1,1,1]');
    let player1Inventory = new Inventory();
    player1Inventory.loadFromLocalStorage('player1Inventory');
    
    // Player 2 data
    let player2Coins = parseInt(localStorage.getItem('player2Coins') || 0);
    let player2Stats = JSON.parse(localStorage.getItem('player2Stats') || '[100,5,1,1,1,1,1]');
    let player2Inventory = new Inventory();
    player2Inventory.loadFromLocalStorage('player2Inventory');
    
    // Initial display
    document.getElementById('waveNumber').textContent = waveNumber;
    updatePlayerDisplay(1);
    
    // Player switching
    player1Button.addEventListener('click', function() {
        currentPlayer = 1;
        player1Button.classList.add('active');
        player2Button.classList.remove('active');
        updatePlayerDisplay(1);
    });
    
    player2Button.addEventListener('click', function() {
        currentPlayer = 2;
        player2Button.classList.add('active');
        player1Button.classList.remove('active');
        updatePlayerDisplay(2);
    });
    
    // Generate shop items for both players
    generateShopItems(waveNumber, player1Coins, player2Coins);
    
    // Continue button
    document.getElementById('continueButton').addEventListener('click', function() {
        // Save updated wave index and continue to game
        localStorage.setItem('waveIndex', waveNumber);
        window.location.href = 'coop-game.html';
    });
    
    // Function to update display for selected player
    function updatePlayerDisplay(playerNum) {
        document.getElementById('currentPlayerLabel').textContent = `Player ${playerNum}`;
        
        if (playerNum === 1) {
            document.getElementById('playerCoins').textContent = player1Coins;
            document.getElementById('stat-health').textContent = player1Stats[0];
            document.getElementById('stat-regen').textContent = player1Stats[1];
            document.getElementById('stat-attack').textContent = player1Stats[2];
            document.getElementById('stat-speed').textContent = player1Stats[3];
            document.getElementById('stat-range').textContent = player1Stats[4];
            document.getElementById('stat-move').textContent = player1Stats[5];
            document.getElementById('stat-luck').textContent = player1Stats[6];
        } else {
            document.getElementById('playerCoins').textContent = player2Coins;
            document.getElementById('stat-health').textContent = player2Stats[0];
            document.getElementById('stat-regen').textContent = player2Stats[1];
            document.getElementById('stat-attack').textContent = player2Stats[2];
            document.getElementById('stat-speed').textContent = player2Stats[3];
            document.getElementById('stat-range').textContent = player2Stats[4];
            document.getElementById('stat-move').textContent = player2Stats[5];
            document.getElementById('stat-luck').textContent = player2Stats[6];
        }
    }
    
    // Function to handle item purchase
    function buyItem(item, element) {
        let playerCoins, playerStats, playerInventory;
        
        if (currentPlayer === 1) {
            playerCoins = player1Coins;
            playerStats = player1Stats;
            playerInventory = player1Inventory;
        } else {
            playerCoins = player2Coins;
            playerStats = player2Stats;
            playerInventory = player2Inventory;
        }
        
        if (playerCoins >= item.price) {
            // Deduct coins
            playerCoins -= item.price;
            
            // Update stats or add weapon to inventory
            if (item.type === 'weapon') {
                // Add weapon to inventory
                const weaponStats = [...item.stats, item.img];
                const weapon = new Weapon(...weaponStats);
                playerInventory.addWeapon(weapon);
                
                // Save inventory
                if (currentPlayer === 1) {
                    playerInventory.saveToLocalStorage('player1Inventory');
                } else {
                    playerInventory.saveToLocalStorage('player2Inventory');
                }
            } else if (item.type === 'item') {
                // Update player stats
                const newStats = playerStats.map((stat, index) => stat + item.stats[index]);
                playerStats = newStats;
                
                // Update display
                document.getElementById('stat-health').textContent = newStats[0];
                document.getElementById('stat-regen').textContent = newStats[1];
                document.getElementById('stat-attack').textContent = newStats[2];
                document.getElementById('stat-speed').textContent = newStats[3];
                document.getElementById('stat-range').textContent = newStats[4];
                document.getElementById('stat-move').textContent = newStats[5];
                document.getElementById('stat-luck').textContent = newStats[6];
            }
            
            // Save updated coins and stats
            if (currentPlayer === 1) {
                player1Coins = playerCoins;
                player1Stats = playerStats;
                localStorage.setItem('player1Coins', player1Coins);
                localStorage.setItem('player1Stats', JSON.stringify(player1Stats));
                element.classList.add('purchased-p1');
            } else {
                player2Coins = playerCoins;
                player2Stats = playerStats;
                localStorage.setItem('player2Coins', player2Coins);
                localStorage.setItem('player2Stats', JSON.stringify(player2Stats));
                element.classList.add('purchased-p2');
            }
            
            // Update coins display
            document.getElementById('playerCoins').textContent = playerCoins;
            
        } else {
            alert("Not enough coins!");
        }
    }
    
    function generateShopItems(wave, player1Coins, player2Coins) {
        const weaponsGrid = document.getElementById('weaponsGrid');
        const itemsGrid = document.getElementById('itemsGrid');
        
        // Define available weapons and items
        const weapons = [
            { id: 1, name: "Revolver", price: 10, type: 'weapon', stats: [0, 0, 3, 1, 1.5, 1, 2], img: "./assets/img/weapons/1.png" },
            { id: 2, name: "Kailloux", price: 5, type: 'weapon', stats: [0, 1, 1, 1.2, 1.7, 1.2, 5], img: "./assets/img/weapons/2.png" },
            { id: 3, name: "Briquet", price: 3, type: 'weapon', stats: [0, -1, 1, 1.3, 1, 2, 3], img: "./assets/img/weapons/3.png" },
            { id: 4, name: "Baguette", price: 10, type: 'weapon', stats: [1, 2, 2, 1.4, 2, 3, 2], img: "./assets/img/weapons/4.png" },
            { id: 5, name: "Machette", price: 10, type: 'weapon', stats: [0, 0.5, 2, 1, 1.5, 2, 2], img: "./assets/img/weapons/5.png" },
            { id: 6, name: "Hache", price: 15, type: 'weapon', stats: [0, 0, 0.75, 1, 1.6, 1, 2], img: "./assets/img/weapons/6.png" },
            { id: 7, name: "WiiMote", price: 50, type: 'weapon', stats: [2, 3, 3, 3, 3, 3, 1], img: "./assets/img/weapons/7.png" },
            { id: 8, name: "Gant de Box", price: 10, type: 'weapon', stats: [0, 0, 1.3, 2, 1.5, 2, 5], img: "./assets/img/weapons/8.png" },
            { id: 9, name: "Etoile Mario", price: 20, type: 'weapon', stats: [5, 1, 3, 3, 1.6, 3, 3], img: "./assets/img/weapons/9.png" },
            { id: 10, name: "#####", price: 100, type: 'weapon', stats: [10, 10, 10, 5, 5, 5, 10], img: "./assets/img/weapons/10.png" },
        ];
        
        const items = [
            { id: 101, name: "Health Potion", price: 5, type: 'item', stats: [20, 0, 0, 0, 0, 0, 0], img: "./assets/img/items/heal.png" },
            { id: 102, name: "Speed Boost", price: 8, type: 'item', stats: [0, 0, 0, 0, 0, 1, 0], img: "./assets/img/items/boots.png" },
            { id: 103, name: "Healing Charm", price: 12, type: 'item', stats: [0, 2, 0, 0, 0, 0, 0], img: "./assets/img/items/charm.png" },
            { id: 104, name: "Power Stone", price: 15, type: 'item', stats: [0, 0, 1, 0, 0, 0, 0], img: "./assets/img/items/stone.png" },
            { id: 105, name: "Lucky Coin", price: 20, type: 'item', stats: [0, 0, 0, 0, 0, 0, 2], img: "./assets/img/items/lucky.png" },
            { id: 106, name: "Range Extender", price: 25, type: 'item', stats: [0, 0, 0, 0, 1, 0, 0], img: "./assets/img/items/scope.png" },
            { id: 107, name: "Attack Speed", price: 30, type: 'item', stats: [0, 0, 0, 1, 0, 0, 0], img: "./assets/img/items/hourglass.png" },
        ];
        
        // Scale prices based on wave
        const priceScaling = 1 + (wave * 0.1);
        
        // Generate random subset of items for the shop
        const availableWeapons = shuffleArray(weapons)
            .slice(0, 4)
            .map(weapon => ({
                ...weapon,
                price: Math.floor(weapon.price * priceScaling)
            }));
        
        const availableItems = shuffleArray(items)
            .slice(0, 5)
            .map(item => ({
                ...item,
                price: Math.floor(item.price * priceScaling)
            }));
        
        // Add weapons to DOM
        availableWeapons.forEach(weapon => {
            const itemElement = createShopItem(weapon, player1Coins, player2Coins);
            weaponsGrid.appendChild(itemElement);
        });
        
        // Add items to DOM
        availableItems.forEach(item => {
            const itemElement = createShopItem(item, player1Coins, player2Coins);
            itemsGrid.appendChild(itemElement);
        });
    }
    
    function createShopItem(item, player1Coins, player2Coins) {
        const itemElement = document.createElement('div');
        itemElement.className = 'shop-item';
        itemElement.dataset.id = item.id;
        itemElement.dataset.type = item.type;
        itemElement.dataset.stats = JSON.stringify(item.stats);
        itemElement.dataset.price = item.price;
        itemElement.dataset.img = item.img;
        
        // Create HTML structure
        itemElement.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <div class="item-info">
                <h3>${item.name}</h3>
                <p class="price">${item.price} coins</p>
                <div class="stats-preview">
                    ${item.stats.map((stat, index) => {
                        if (stat === 0) return '';
                        const statNames = ['HP', 'Regen', 'ATK', 'SPD', 'RNG', 'MOV', 'LUCK'];
                        const statClass = stat > 0 ? 'positive' : 'negative';
                        return `<span class="${statClass}">${stat > 0 ? '+' : ''}${stat} ${statNames[index]}</span>`;
                    }).filter(s => s !== '').join(' ')}
                </div>
            </div>
        `;
        
        // Add purchase event
        itemElement.addEventListener('click', function(event) {
            // Check if already purchased by current player
            if ((currentPlayer === 1 && this.classList.contains('purchased-p1')) ||
                (currentPlayer === 2 && this.classList.contains('purchased-p2'))) {
                alert("You've already purchased this item!");
                return;
            }
            
            // Check if player can afford
            const playerCoins = currentPlayer === 1 ? player1Coins : player2Coins;
            if (playerCoins >= item.price) {
                buyItem(item, this);
            } else {
                alert("Not enough coins!");
            }
        });
        
        return itemElement;
    }
    
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
});