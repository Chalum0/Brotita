document.addEventListener('DOMContentLoaded', function() {
    // Get player information
    let playerCoins = parseInt(localStorage.getItem('playerCoins') || 0);
    const waveNumber = parseInt(localStorage.getItem('waveIndex') || 0) + 1;
    const playerStats = JSON.parse(localStorage.getItem('playerStats') || '[100,5,1,1,1,1,1]');
    
    // Load player inventory
    const inventory = new Inventory();
    inventory.loadFromLocalStorage();
    
    // Display information
    document.getElementById('playerCoins').textContent = playerCoins;
    document.getElementById('waveNumber').textContent = waveNumber;
    
    // Display player stats
    document.getElementById('stat-health').textContent = playerStats[0];
    document.getElementById('stat-regen').textContent = playerStats[1];
    document.getElementById('stat-attack').textContent = playerStats[2];
    document.getElementById('stat-speed').textContent = playerStats[3];
    document.getElementById('stat-range').textContent = playerStats[4];
    document.getElementById('stat-move').textContent = playerStats[5];
    document.getElementById('stat-luck').textContent = playerStats[6];
    
    // Generate shop items
    generateShopItems(waveNumber, playerCoins);
    
    // Continue button
    document.getElementById('continueButton').addEventListener('click', function() {
        // Save updated wave index and continue to game
        localStorage.setItem('waveIndex', waveNumber);
        window.location.href = 'game.html';
    });
    
    // Function to update player coins display
    function updateCoinsDisplay() {
        document.getElementById('playerCoins').textContent = playerCoins;
    }
    
    // Function to handle item purchase
    function buyItem(item) {
        if (playerCoins >= item.price) {
            // Deduct coins
            playerCoins -= item.price;
            localStorage.setItem('playerCoins', playerCoins);
            updateCoinsDisplay();
            
            // Update stats or add weapon to inventory
            if (item.type === 'weapon') {
                // Add weapon to inventory
                const weaponStats = [...item.stats, item.img];
                
                // Load current inventory
                const inventory = new Inventory();
                inventory.loadFromLocalStorage();
                
                // Add new weapon
                const weapon = new Weapon(...weaponStats);
                inventory.addWeapon(weapon);
                inventory.saveToLocalStorage();
                
            } else if (item.type === 'item') {
                // Update player stats
                const newStats = playerStats.map((stat, index) => stat + item.stats[index]);
                localStorage.setItem('playerStats', JSON.stringify(newStats));
                
                // Update display
                document.getElementById('stat-health').textContent = newStats[0];
                document.getElementById('stat-regen').textContent = newStats[1];
                document.getElementById('stat-attack').textContent = newStats[2];
                document.getElementById('stat-speed').textContent = newStats[3];
                document.getElementById('stat-range').textContent = newStats[4];
                document.getElementById('stat-move').textContent = newStats[5];
                document.getElementById('stat-luck').textContent = newStats[6];
            }
            
            // Mark item as purchased
            event.currentTarget.classList.add('purchased');
            event.currentTarget.onclick = null; // Remove click handler
            
        } else {
            alert("Not enough coins!");
        }
    }
    
    function generateShopItems(wave, playerCoins) {
        const weaponsGrid = document.getElementById('weaponsGrid');
        const itemsGrid = document.getElementById('itemsGrid');
        
        // Define available weapons and items
        const weapons = [
            // ), RNG = Range, MOV = Move Speed, LUCK = Luck
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
            .slice(0, 3)
            .map(weapon => ({
                ...weapon,
                price: Math.floor(weapon.price * priceScaling)
            }));
        
        const availableItems = shuffleArray(items)
            .slice(0, 4)
            .map(item => ({
                ...item,
                price: Math.floor(item.price * priceScaling)
            }));
        
        // Add weapons to DOM
        availableWeapons.forEach(weapon => {
            const itemElement = createShopItem(weapon, playerCoins);
            weaponsGrid.appendChild(itemElement);
        });
        
        // Add items to DOM
        availableItems.forEach(item => {
            const itemElement = createShopItem(item, playerCoins);
            itemsGrid.appendChild(itemElement);
        });
    }
    
    function createShopItem(item, playerCoins) {
        const itemElement = document.createElement('div');
        itemElement.className = 'shop-item';
        itemElement.dataset.id = item.id;
        itemElement.dataset.type = item.type;
        itemElement.dataset.stats = JSON.stringify(item.stats);
        itemElement.dataset.price = item.price;
        itemElement.dataset.img = item.img;
        
        // Check if player can afford this item
        const canBuy = playerCoins >= item.price;
        if (!canBuy) {
            itemElement.classList.add('unaffordable');
        }
        
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
        if (canBuy) {
            itemElement.addEventListener('click', function(event) {
                buyItem(item);
            });
        }
        
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