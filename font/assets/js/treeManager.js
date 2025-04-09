class TreeManager {
  constructor() {
    this.trees = [];
  }

  drawTrees(ctx) {
    this.trees.forEach(tree => {
      tree.draw(ctx);
    })
  }

  spawnTree(x, y) {
    this.trees.push(new Tree(x, y));
  }

  checkCollisions(player){
    this.trees.forEach(tree => {
      if (tree.collidesWith(player)) {
        player.heal(tree.healing)
        this.trees.splice(this.trees.indexOf(tree), 1);
        return;
      }
    })
  }

}