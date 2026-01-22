class TetrisManager {
  constructor(document) {
    this.document = document
    this.template = document.getElementById('full-game-template')
    this.instances = new Set;
  }

  createPlayer(opponent) {
    const element = this.document.importNode(this.template.content, true).children[0];
    const tetris = new Tetris(element);
    this.instances.add(tetris);

    if (opponent) {
      const startButton = element.querySelector(".start-button")
      if (startButton) startButton.remove()
    }
    
    const container = this.document.getElementById('game-container') || this.document.body;
    container.appendChild(tetris.element);
    return tetris;
  }

  removePlayer(tetris) {
    this.instances.delete(tetris)
    const container = this.document.getElementById('game-container') || this.document.body;
    container.removeChild(tetris.element);
  }

  sortPlayers(tetrisGames) {
    const container = this.document.getElementById('game-container') || this.document.body;
    tetrisGames.forEach(tetris => {
      container.appendChild(tetris.element);
    })
  }
}
