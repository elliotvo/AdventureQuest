const heroes = [
  {
    id: "sword",
    name: "Sværdhelten",
    initial: "S",
    color: "#d4574f",
    health: 14,
    power: 4,
    description: "God til at kæmpe mod monstre.",
  },
  {
    id: "shield",
    name: "Skjoldhelten",
    initial: "K",
    color: "#3f78c5",
    health: 18,
    power: 3,
    description: "Har ekstra liv og er svær at slå ud.",
  },
  {
    id: "spark",
    name: "Lynhelten",
    initial: "L",
    color: "#8d4bd8",
    health: 12,
    power: 5,
    description: "Slår hårdt, men har ikke så mange liv.",
  },
];

const caveMap = [
  "########",
  "#S..T..#",
  "#.##.#.#",
  "#..M.#E#",
  "#T.#...#",
  "#..M.T.#",
  "########",
];

const treasureGoal = 3;
const monsterStartHealth = 7;
const monsterDamage = 2;

const heroList = document.querySelector("#hero-list");
const heroPicker = document.querySelector("#hero-picker");
const gamePanel = document.querySelector("#game-panel");
const board = document.querySelector("#board");
const eventLog = document.querySelector("#event-log");
const restartButton = document.querySelector("#restart-button");
const statHero = document.querySelector("#stat-hero");
const statHealth = document.querySelector("#stat-health");
const statPower = document.querySelector("#stat-power");
const statTreasures = document.querySelector("#stat-treasures");

let game = null;

function createBoardState() {
  const tiles = caveMap.map((row) => row.split(""));
  const monsters = {};
  let start = { x: 1, y: 1 };

  tiles.forEach((row, y) => {
    row.forEach((tile, x) => {
      if (tile === "S") {
        start = { x, y };
        tiles[y][x] = ".";
      }

      if (tile === "M") {
        monsters[coordKey(x, y)] = monsterStartHealth;
      }
    });
  });

  return { tiles, monsters, start };
}

function coordKey(x, y) {
  return `${x},${y}`;
}

function renderHeroPicker() {
  heroList.innerHTML = heroes
    .map(
      (hero) => `
        <button class="hero-card" type="button" data-hero-id="${hero.id}">
          <span class="hero-art" style="--hero-color: ${hero.color}">${hero.initial}</span>
          <strong>${hero.name}</strong>
          <span>${hero.description}</span>
          <span>Liv: ${hero.health} · Styrke: ${hero.power}</span>
        </button>
      `,
    )
    .join("");
}

function startGame(heroId) {
  const hero = heroes.find((candidate) => candidate.id === heroId);
  const boardState = createBoardState();

  game = {
    hero,
    tiles: boardState.tiles,
    monsters: boardState.monsters,
    position: boardState.start,
    health: hero.health,
    treasures: 0,
    isOver: false,
    messages: [
      `${hero.name} går ind i grotten. Find ${treasureGoal} skatte!`,
    ],
  };

  heroPicker.classList.add("is-hidden");
  gamePanel.classList.remove("is-hidden");
  renderGame();
}

function restartGame() {
  game = null;
  heroPicker.classList.remove("is-hidden");
  gamePanel.classList.add("is-hidden");
  renderHeroPicker();
}

function moveHero(direction) {
  if (!game || game.isOver) {
    return;
  }

  const movement = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  }[direction];

  if (!movement) {
    return;
  }

  const next = {
    x: game.position.x + movement.x,
    y: game.position.y + movement.y,
  };

  const tile = game.tiles[next.y]?.[next.x];

  if (!tile || tile === "#") {
    addMessage("Av! Der er en grottevæg i vejen.");
    renderGame();
    return;
  }

  if (tile === "E" && game.treasures < treasureGoal) {
    addMessage(`Udgangen åbner først, når du har ${treasureGoal} skatte.`);
    renderGame();
    return;
  }

  if (tile === "M") {
    fightMonster(next);
    return;
  }

  game.position = next;

  if (tile === "T") {
    game.treasures += 1;
    game.tiles[next.y][next.x] = ".";
    addMessage(`Du fandt en skat! Nu har du ${game.treasures}.`);
  }

  if (tile === "E") {
    game.isOver = true;
    addMessage("Du fandt udgangen og vandt AdventureQuest!");
  }

  renderGame();
}

function fightMonster(next) {
  const key = coordKey(next.x, next.y);
  game.monsters[key] -= game.hero.power;

  if (game.monsters[key] <= 0) {
    delete game.monsters[key];
    game.tiles[next.y][next.x] = ".";
    game.position = next;
    addMessage("Monsteret blev besejret! Grotten er lidt mere sikker.");
    renderGame();
    return;
  }

  game.health -= monsterDamage;
  addMessage(
    `Du ramte monsteret, men det ramte tilbage. Monsterets liv: ${game.monsters[key]}.`,
  );

  if (game.health <= 0) {
    game.health = 0;
    game.isOver = true;
    addMessage("Helten løb tør for liv. Prøv igen med en ny plan!");
  }

  renderGame();
}

function addMessage(message) {
  game.messages = [message, ...game.messages].slice(0, 6);
}

function renderGame() {
  renderStats();
  renderBoard();
  renderLog();
}

function renderStats() {
  statHero.textContent = game.hero.name;
  statHealth.textContent = `${game.health} / ${game.hero.health}`;
  statPower.textContent = game.hero.power;
  statTreasures.textContent = `${game.treasures} / ${treasureGoal}`;
}

function renderBoard() {
  board.innerHTML = "";
  board.style.setProperty("--hero-color", game.hero.color);

  game.tiles.forEach((row, y) => {
    row.forEach((tile, x) => {
      const cell = document.createElement("div");
      const hasHero = game.position.x === x && game.position.y === y;

      cell.className = `tile ${tileClass(tile)}${hasHero ? " hero-tile" : ""}`;
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", tileLabel(tile, hasHero));

      if (hasHero) {
        cell.dataset.hero = game.hero.initial;
      } else {
        cell.textContent = tileText(tile);
      }

      board.appendChild(cell);
    });
  });
}

function tileClass(tile) {
  return {
    "#": "wall",
    "T": "treasure",
    "M": "monster",
    "E": "exit",
  }[tile] ?? "floor";
}

function tileText(tile) {
  return {
    "#": "",
    "T": "$",
    "M": "M",
    "E": "Ud",
  }[tile] ?? "";
}

function tileLabel(tile, hasHero) {
  if (hasHero) {
    return `Helten ${game.hero.name}`;
  }

  return {
    "#": "Væg",
    "T": "Skat",
    "M": "Monster",
    "E": "Udgang",
  }[tile] ?? "Grottegang";
}

function renderLog() {
  eventLog.innerHTML = game.messages
    .map((message) => `<li>${message}</li>`)
    .join("");
}

heroList.addEventListener("click", (event) => {
  const heroButton = event.target.closest("[data-hero-id]");

  if (heroButton) {
    startGame(heroButton.dataset.heroId);
  }
});

document.querySelectorAll("[data-direction]").forEach((button) => {
  button.addEventListener("click", () => moveHero(button.dataset.direction));
});

document.addEventListener("keydown", (event) => {
  const directionByKey = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
  };

  const direction = directionByKey[event.key];

  if (direction) {
    event.preventDefault();
    moveHero(direction);
  }
});

restartButton.addEventListener("click", restartGame);

renderHeroPicker();
