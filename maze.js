let scoreDisplay = document.getElementById("scoreDisplay"); // Get score display element
let score = document.getElementById("score"); // Get score element
// Generating the maze

// Initialize the canvas
let loss = document.querySelector(".loss");
let maze = document.querySelector(".maze");
let ctx = maze.getContext("2d");
let generationComplete = false;

let current;
let goal;

// Add these variables at the top of the file
let showArrow = true; // Flag to control arrow visibility
const arrowPosition = { x: 0, y: 0 }; // Position of the arrow

class Maze {
  constructor(size, rows, columns) {
    this.size = size;
    this.columns = columns;
    this.rows = rows;
    this.grid = [];
    this.stack = [];
    this.ghosts = [];
  }

  addGhost(color, colNum, rowNum) {
    let ghost = new Ghost(colNum, rowNum, this, color);
    this.ghosts.push(ghost);
  }

  // Set the grid: Create new this.grid array based on number of instance rows and columns
  setup() {
    for (let r = 0; r < this.rows; r++) {
      let row = [];
      for (let c = 0; c < this.columns; c++) {
        let cell = new Cell(r, c, this.grid, this.size);
        row.push(cell);
      }
      this.grid.push(row);
    }
    current = this.grid[0][0];
    this.grid[this.rows - 1][this.columns - 1].goal = true;
    this.placePellets();

    // Positioning the ghosts
    this.addGhost("red", 0, this.rows - 1);
    this.addGhost("pink", Math.floor(this.columns / 2), Math.floor(this.rows / 2));
    this.addGhost("blue", this.columns - 1, 0);

    // Set the initial position of the arrow
    arrowPosition.x = current.colNum * this.size / this.columns + this.size / (2 * this.columns);
    arrowPosition.y = current.rowNum * this.size / this.rows + this.size / (2 * this.rows);

    setInterval(() => {
      this.moveGhosts();
      this.draw();
      current.highlight(this.columns);
    }, 500);
  }

  // Draw the canvas by setting the size and placing the cells in the grid array on the canvas.
  draw() {
    maze.width = this.size;
    maze.height = this.size;
    maze.style.background = "black";
    current.visited = true;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.columns; c++) {
        let grid = this.grid;
        grid[r][c].show(this.size, this.rows, this.columns);
      }
    }

    let next = current.checkNeighbours();
    if (next) {
      next.visited = true;  
      this.stack.push(current);
      current.highlight(this.columns);
      current.removeWalls(current, next);
      current = next;
    } else if (this.stack.length > 0) {
      let cell = this.stack.pop();
      current = cell;
      current.highlight(this.columns);
    }

    for (let ghost of this.ghosts) {
      ghost.draw();
    }

    // Draw the arrow if showArrow is true
    if (showArrow) {
      ctx.fillStyle = "yellow"; // Arrow color
      ctx.beginPath();
      // Position the arrow outside the maze, pointing towards the player
      const arrowOffset = 10; // Distance from the maze
      ctx.moveTo(arrowPosition.x + arrowOffset, arrowPosition.y); // Arrow tip
      ctx.lineTo(arrowPosition.x + arrowOffset + 5, arrowPosition.y - 5); // Arrow left
      ctx.lineTo(arrowPosition.x + arrowOffset + 5, arrowPosition.y + 5); // Arrow right
      ctx.fill();

      // Draw the message next to the arrow
      ctx.fillStyle = "white"; // Message color
      ctx.font = "16px Arial";
      ctx.fillText("This is you", arrowPosition.x + arrowOffset + 15, arrowPosition.y);
    }

    if (this.stack.length === 0) {
      generationComplete = true;
      return;
    }

    window.requestAnimationFrame(() => {
      this.draw();
    });
  }
  
  gameOver() {
    for (let ghost of this.ghosts) {
      if (current.colNum === ghost.colNum && current.rowNum === ghost.rowNum){
        loss.style.display = "block";
      }
    }
  }

  moveGhosts() {
      this.ghosts.forEach(ghost => ghost.moveRandom());
      scoreDisplay.style.display = "block";
      this.gameOver(); // Check for game over conditions
  }

  placePellets() {
    const totalCells = this.rows * this.columns;
    const pelletCount = Math.floor(totalCells * 0.1);
    let placedPellets = 0;

    while (placedPellets < pelletCount) {
      const randomRow = Math.floor(Math.random() * this.rows);
      const randomCol = Math.floor(Math.random() * this.columns);
      const cell = this.grid[randomRow][randomCol];

      if (!cell.hasPellet && !cell.goal) {
        cell.hasPellet = true;
        placedPellets++;
      }
    }
  }
}

// Add an event listener for player movement
document.addEventListener('keydown', (event) => {
    // Existing movement logic...
    
    // Hide the arrow when the player moves
    showArrow = false;
});

class Cell {
  constructor(rowNum, colNum, parentGrid, parentSize) {
    this.rowNum = rowNum;
    this.colNum = colNum;
    this.visited = false;
    this.walls = {
      topWall: true,
      rightWall: true,
      bottomWall: true,
      leftWall: true,
    };
    this.goal = false;
    this.hasPellet = false;
    this.parentGrid = parentGrid;
    this.parentSize = parentSize;
  }

  checkNeighbours() {
    let grid = this.parentGrid;
    let row = this.rowNum;
    let col = this.colNum;
    let neighbours = [];

    let top = row !== 0 ? grid[row - 1][col] : undefined;
    let right = col !== grid.length - 1 ? grid[row][col + 1] : undefined;
    let bottom = row !== grid.length - 1 ? grid[row + 1][col] : undefined;
    let left = col !== 0 ? grid[row][col - 1] : undefined;

    if (top && !top.visited) neighbours.push(top);     
    if (right && !right.visited) neighbours.push(right);
    if (bottom && !bottom.visited) neighbours.push(bottom);
    if (left && !left.visited) neighbours.push(left);

    if (neighbours.length !== 0) {
      let random = Math.floor(Math.random() * neighbours.length);
      return neighbours[random];
    } else {
      return undefined;
    }
  }

  drawTopWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size / columns, y);
    ctx.stroke();
  }

  drawRightWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x + size / columns, y);
    ctx.lineTo(x + size / columns, y + size / rows);
    ctx.stroke();
  }

  drawBottomWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x, y + size / rows);
    ctx.lineTo(x + size / columns, y + size / rows);
    ctx.stroke();
  }

  drawLeftWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + size / rows);
    ctx.stroke();
  }

  highlight(columns) {
    let x = (this.colNum * this.parentSize) / columns + 1;
    let y = (this.rowNum * this.parentSize) / columns + 1;
    ctx.fillStyle = "purple";

    ctx.fillRect(
      x,
      y,
      this.parentSize / columns - 3,
      this.parentSize / columns - 3
    );
  }

  removeWalls(cell1, cell2) {
    let x = cell1.colNum - cell2.colNum;
    if (x === 1) {
      cell1.walls.leftWall = false;
      cell2.walls.rightWall = false;
    } else if (x === -1) {
      cell1.walls.rightWall = false;
      cell2.walls.leftWall = false;
    }
    let y = cell1.rowNum - cell2.rowNum;
    if (y === 1) {
      cell1.walls.topWall = false;
      cell2.walls.bottomWall = false;
    } else if (y === -1) {
      cell1.walls.bottomWall = false;
      cell2.walls.topWall = false;
    }
  }

  show(size, rows, columns) {
    let x = (this.colNum * size) / columns;
    let y = (this.rowNum * size) / rows;
    ctx.strokeStyle = "#ffffff";
    ctx.fillStyle = "black";
    ctx.lineWidth = 2;
    if (this.walls.topWall) this.drawTopWall(x, y, size, columns, rows);
    if (this.walls.rightWall) this.drawRightWall(x, y, size, columns, rows);
    if (this.walls.bottomWall) this.drawBottomWall(x, y, size, columns, rows);
    if (this.walls.leftWall) this.drawLeftWall(x, y, size, columns, rows);
    if (this.visited) {
      ctx.fillRect(x + 1, y + 1, size / columns - 2, size / rows - 2);
    }
    if (this.goal) {
      const gradient = ctx.createRadialGradient(x + size / columns / 2, y + size / rows / 2, 5, x + size / columns / 2, y + size / rows / 2, size / columns / 2);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)"); // Center color
      gradient.addColorStop(1, "rgba(83, 247, 43, 0)"); // Outer color
      ctx.fillStyle = gradient;
      ctx.fillRect(x + 1, y + 1, size / columns - 2, size / rows - 2);
    }
    if (this.hasPellet) {
      ctx.fillStyle = "grey";
      ctx.beginPath();
      ctx.arc(x + size / columns / 2, y + size / rows / 2, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

class Ghost {
  constructor(colNum, rowNum, maze, color) {
    this.colNum = colNum;
    this.rowNum = rowNum;
    this.maze = maze;
    this.color = color;
    this.lastVisitedCell = [-1,-1]; // Track last visited cells
    this.moveCounter = 0; // Track moves since last visit
  }

  draw() {
    let x = (this.colNum * this.maze.size) / this.maze.columns + 1;
    let y = (this.rowNum * this.maze.size) / this.maze.columns + 1;
    ctx.fillStyle = this.color;

    ctx.fillRect(
      x,
      y,
      this.maze.size / this.maze.columns - 3,
      this.maze.size / this.maze.columns - 3
    );
  }






// make it so they dont run off the map 






  moveDown() {
    let currentTile = this.maze.grid[this.rowNum][this.colNum];
      if (
        (!currentTile.walls.bottomWall && this.lastVisitedCell[0] !== this.rowNum + 1)
      // || (currentTile.walls.topWall && currentTile.walls.rightWall && currentTile.walls.leftWall) 
      ) {
      this.lastVisitedCell = [this.rowNum, this.colNum];
      this.rowNum += 1;
      return true;
    }
    return false;
  }
  moveUp() {
    let currentTile = this.maze.grid[this.rowNum][this.colNum];
    if (
    (!currentTile.walls.topWall && this.lastVisitedCell[0] !== this.rowNum - 1 ) 
  //  || (currentTile.walls.bottomWall && currentTile.walls.rightWall && currentTile.walls.leftWall)
   ){
      this.lastVisitedCell = [this.rowNum, this.colNum];
      this.rowNum -= 1;
      return true;
    }
    return false;
  }
  moveRight() {
    let currentTile = this.maze.grid[this.rowNum][this.colNum];
    if( (!currentTile.walls.rightWall && this.lastVisitedCell[1] !== this.colNum + 1  ) 
 //     || (currentTile.walls.bottomWall && currentTile.walls.topWall && currentTile.walls.leftWall) 
    ){
      this.lastVisitedCell = [this.rowNum, this.colNum];
      this.colNum += 1;
      return true;
    }
    return false;
  }
  moveLeft() {
    let currentTile = this.maze.grid[this.rowNum][this.colNum];
    if ((!currentTile.walls.leftWall && this.lastVisitedCell[1] !== this.colNum - 1  )
    //  || (currentTile.walls.bottomWall && currentTile.walls.rightWall && currentTile.walls.topWall)
  ) {
      this.lastVisitedCell = [this.rowNum, this.colNum];
      this.colNum -= 1;
      return true;
    }
    return false;
  }

  moveRandom() {
    let moved = false;
    let tries = 0;
    while (!moved && tries < 10) {
      tries++;
      let dir = Math.floor(Math.random() * 4); // 0, 1, 2, 3
     
      switch (dir) {
        case 0:
          moved = this.moveDown();
          break;
        case 1:
          moved = this.moveUp();
          break;
        case 2:
          moved = this.moveLeft();
          break;
        case 3:
          moved = this.moveRight();
          break;
      }
    }
  }
}



