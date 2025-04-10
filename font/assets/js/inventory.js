class Inventory {
  constructor() {
    this.items = [];
    this.weapons = [];
  }

  addWeapon(weapon){
    const max_weapons = 6;
    if (this.weapons.length < max_weapons) {
      this.weapons.push(weapon)
    }
  }

  getStats() {
    let max_health = 0;
    let regeneration = 0;
    let strength = 0;
    let range = 0;
    let speed = 0;
    let luck = 0;
    this.items.forEach(item => {
      max_health += item.max_health;
      regeneration += item.regeneration;
      strength += item.strength;
      range += item.range;
      speed += item.speed;
      luck += item.luck;
    })
    return [max_health, regeneration, strength, range, speed, luck];
  }

  // addItem(item) {
  //   const max_weapons = 6;
  //   if (this.items.length < max_weapons) {
  //     this.items.push(item);
  //   }
  // }

  removeWeapon(weapon) {
    this.items.splice(this.items.indexOf(weapon), 1);
  }


}