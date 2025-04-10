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

  // addItem(item) {
  //   const max_weapons = 6;
  //   if (this.items.length < max_weapons) {
  //     this.items.push(item);
  //   }
  // }

  removeItem(item) {
    this.items.splice(this.items.indexOf(item), 1);
  }


}