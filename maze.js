
let scoreDisplay = document.getElementById("scoreDisplay"); // Get score display element
let score = document.getElementById("score"); // Get score  element
// Generating the maze

// Initialize the canvas
let loss = document.querySelector(".loss");
let maze = document.querySelector(".maze");
let ctx = maze.getContext("2d");
let generationComplete = false;

let current;
let goal;

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
        // Create a new instance of the Cell class for each element in the 2D array and push to the maze grid array
        let cell = new Cell(r, c, this.grid, this.size);
        row.push(cell);
      }
      this.grid.push(row);
    }
    // Set the starting grid and place pellets
    current = this.grid[0][0];
    this.grid[this.rows - 1][this.columns - 1].goal = true;
    this.placePellets(); // Call to place pellets in the maze

    // Positioning the ghosts
    this.addGhost("red", 0, this.rows - 1); // Bottom left
    this.addGhost("pink", Math.floor(this.columns / 2), Math.floor(this.rows / 2)); // Middle
    this.addGhost("blue", this.columns - 1, 0); // Top right
    
  
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
    // Set the first cell as visited
    current.visited = true;
    // Loop through the 2d grid array and call the show method for each cell instance    
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.columns; c++) {
        let grid = this.grid;
        grid[r][c].show(this.size, this.rows, this.columns);
      }
    }
    // This function will assign the variable 'next' to random cell out of the current cells available neighbouting cells
    let next = current.checkNeighbours();
    // If there is a non visited neighbour cell
    if (next) {
      next.visited = true;  
      // Add the current cell to the stack for backtracking
      this.stack.push(current);
      // this function will highlight the current cell on the grid. The parameter columns is passed
      // in order to set the size of the cell
      current.highlight(this.columns);
      // This function compares the current cell to the next cell and removes the relevant walls for each cell
      current.removeWalls(current, next);
      // Set the nect cell to the current cell
      current = next;

      // Else if there are no available neighbours start backtracking using the stack
    } else if (this.stack.length > 0) {
      let cell = this.stack.pop();
      current = cell;
      current.highlight(this.columns);
    }

    for (let ghost of this.ghosts) {
      ghost.draw();
    }

    // If no more items in the stack then all cells have been visted and the function can be exited
    if (this.stack.length === 0) {
      generationComplete = true;
      return;
    }

    // Recursively call the draw function. This will be called up until the stack is empty
    window.requestAnimationFrame(() => {
      this.draw();
    });
  }
  
  gameOver() {
    //fix this pice of code that is not working beacuse it not decctecting //
    //its probally doent know player .current and ghost.curent// 
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
    const pelletCount = Math.floor(totalCells * 0.1); // Place pellets in 10% of the cells
    let placedPellets = 0;

    while (placedPellets < pelletCount) {
      const randomRow = Math.floor(Math.random() * this.rows);
      const randomCol = Math.floor(Math.random() * this.columns);
      const cell = this.grid[randomRow][randomCol];

      if (!cell.hasPellet && !cell.goal) { // Ensure pellets are not placed on the goal
        cell.hasPellet = true;
        placedPellets++;
      }
    }
  }
}

class Cell {
  // Constructor takes in the rowNum and colNum which will be used as coordinates to draw on the canvas.
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
    this.hasPellet = false; // New property for pellets
    // parentGrid is passed in to enable the  checkneighbours method.
    // parentSize is passed in to set the size of each cell on the grid
    this.parentGrid = parentGrid;
    this.parentSize = parentSize;
  }

  checkNeighbours() {
    let grid = this.parentGrid;
    let row = this.rowNum;
    let col = this.colNum;
    let neighbours = [];

    // The following lines push all available neighbours to the neighbours array
    // undefined is returned where the index is out of bounds (edge cases)
    let top = row !== 0 ? grid[row - 1][col] : undefined;
    let right = col !== grid.length - 1 ? grid[row][col + 1] : undefined;
    let bottom = row !== grid.length - 1 ? grid[row + 1][col] : undefined;
    let left = col !== 0 ? grid[row][col - 1] : undefined;

    // if the following are not 'undefined' then push them to the neighbours array
    if (top && !top.visited) neighbours.push(top);     
    if (right && !right.visited) neighbours.push(right);
    if (bottom && !bottom.visited) neighbours.push(bottom);
    if (left && !left.visited) neighbours.push(left);

    // Choose a random neighbour from the neighbours array
    if (neighbours.length !== 0) {
      let random = Math.floor(Math.random() * neighbours.length);
      return neighbours[random];
    } else {
      return undefined;
    }
  }

  // Wall drawing functions for each cell. Will be called if relevent wall is set to true in cell constructor
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

  // Highlights the current cell on the grid. Columns is once again passed in to set the size of the grid.
  highlight(columns) {
    // Additions and subtractions added so the highlighted cell does cover the walls
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
    // compares to two cells on x axis
    let x = cell1.colNum - cell2.colNum;
    // Removes the relevant walls if there is a different on x axis
    if (x === 1) {
      cell1.walls.leftWall = false;
      cell2.walls.rightWall = false;
    } else if (x === -1) {
      cell1.walls.rightWall = false;
      cell2.walls.leftWall = false;
    }
    // compares to two cells on x axis
    let y = cell1.rowNum - cell2.rowNum;
    // Removes the relevant walls if there is a different on x axis
    if (y === 1) {
      cell1.walls.topWall = false;
      cell2.walls.bottomWall = false;
    } else if (y === -1) {
      cell1.walls.bottomWall = false;
      cell2.walls.topWall = false;
    }
  }

  // Draws each of the cells on the maze canvas and pellets

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
    // Draw pellet if present
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
  }

  draw() {
    // Additions and subtractions added so the highlighted cell does cover the walls
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

  moveDown() {
    let currentTile = this.maze.grid[this.rowNum][this.colNum];
    if (!currentTile.walls.bottomWall) {
      this.rowNum += 1;
      return true;
    }
    return false;
  }
  moveUp() {
    let currentTile = this.maze.grid[this.rowNum][this.colNum];
    if (!currentTile.walls.topWall) {
      this.rowNum -= 1;
      return true;
    }
    return false;
  }
  moveRight() {
    let currentTile = this.maze.grid[this.rowNum][this.colNum];
    if (!currentTile.walls.rightWall) {
      this.colNum += 1;
      return true;
    }
    return false;
  }
  moveLeft() {
    let currentTile = this.maze.grid[this.rowNum][this.colNum];
    if (!currentTile.walls.leftWall) {
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