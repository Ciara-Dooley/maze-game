let form = document.querySelector("#settings");
let size = document.querySelector("#size");
let rowsCols = document.querySelector("#number");
let complete = document.querySelector(".complete");
let replay = document.querySelector(".replay");
let closeEls = document.querySelectorAll(".close");
let gamescore = 0;
let newMaze;
let allpellet = false;
form.addEventListener("submit", generateMaze);
document.addEventListener("keydown", move);
replay.addEventListener("click", () => {
  location.reload();
});

for (let close of closeEls) {
  close.addEventListener("click", () => {
    complete.style.display = "none";
    loss.style.display = "none";
  });
}

function generateMaze(e) {
  e.preventDefault();

  if (rowsCols.value == "" || size.value == "") {
    return alert("Please enter all fields");
  }

  let mazeSize = size.value;
  let number = rowsCols.value;
  if (mazeSize > 10000 || number > 80) {
    alert("Maze too large!");
    return;
  }

  form.style.display = "none";

  newMaze = new Maze(mazeSize, number, number);
  newMaze.setup();
  newMaze.draw();
}

function move(e) {
  if (!generationComplete) return;
  let key = e.key;
  let row = current.rowNum;
  let col = current.colNum;

  switch (key) {
    case "ArrowUp":
      if (!current.walls.topWall) {
        let next = newMaze.grid[row - 1][col];
        current = next;
        newMaze.draw();
        current.highlight(newMaze.columns);
        // not required if goal is in bottom right
        if (current.goal && allpellet == true ) complete.style.display = "block";
      }
      break;

    case "ArrowRight":
      
      if (!current.walls.rightWall) {
        let next = newMaze.grid[row][col + 1];
        current = next;
        newMaze.draw();
        current.highlight(newMaze.columns);
        if (current.goal && allpellet == true ) complete.style.display = "block";
      }
      break;

    case "ArrowDown":
      
      if (!current.walls.bottomWall) {
        let next = newMaze.grid[row + 1][col];
        current = next;
        newMaze.draw();
        current.highlight(newMaze.columns);
        if (current.goal && allpellet == true ) complete.style.display = "block";
      }
      break;

    case "ArrowLeft":
 
      if (!current.walls.leftWall) {
        let next = newMaze.grid[row][col - 1];
        current = next;
        newMaze.draw();
        current.highlight(newMaze.columns);
        // not required if goal is in bottom right
        if (current.goal && allpellet == true ) complete.style.display = "block";
      }
      break;
  }
 

  if (current.hasPellet) {
    gamescore += 1;
    current.hasPellet = false;
    score.textContent =  gamescore;
  }

}
  function checkpellets(){
  for (let row of this.grid) {
    for (let cell of row) {
      if (cell.hasPellet) {
        let allpellet = true; 
        console.log(true);
      }else{
        let allpellet = false;
      } 
    }
  }
  alert("Maze Complete!");
}