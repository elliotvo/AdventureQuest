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

const directions = [
  { id: "north", label: "Nord", shortLabel: "N", symbol: "^", x: 0, y: -1 },
  { id: "east", label: "Øst", shortLabel: "Ø", symbol: ">", x: 1, y: 0 },
  { id: "south", label: "Syd", shortLabel: "S", symbol: "v", x: 0, y: 1 },
  { id: "west", label: "Vest", shortLabel: "V", symbol: "<", x: -1, y: 0 },
];

const sceneImages = {
  hallway: "assets/cave-hallway.svg",
  wall: "assets/cave-wall.svg",
  monster: "assets/cave-monster.svg",
  treasure: "assets/cave-treasure.svg",
  exit: "assets/cave-exit.svg",
};

const treasureGoal = 3;
const monsterStartHealth = 7;
const monsterDamage = 2;

const heroList = document.querySelector("#hero-list");
const heroPicker = document.querySelector("#hero-picker");
const gamePanel = document.querySelector("#game-panel");
const board = document.querySelector("#board");
const eventLog = document.querySelector("#event-log");
const restartButton = document.querySelector("#restart-button");
const mapToggle = document.querySelector("#map-toggle");
const mapPanel = document.querySelector("#map-panel");
const sceneImage = document.querySelector("#scene-image");
const sceneTitle = document.querySelector("#scene-title");
const sceneDescription = document.querySelector("#scene-description");
const directionLabel = document.querySelector("#direction-label");
const passageHints = document.querySelector("#passage-hints");
const statHero = document.querySelector("#stat-hero");
const statHealth = document.querySelector("#stat-health");
const statPower = document.querySelector("#stat-power");
const statTreasures = document.querySelector("#stat-treasures");
const statDirection = document.querySelector("#stat-direction");

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
    direction: 1,
    health: hero.health,
    treasures: 0,
    isMapVisible: false,
    isOver: false,
    messages: [
      `${hero.name} går ind i grotten og kigger mod øst. Find ${treasureGoal} skatte!`,
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

function performAction(action) {
  if (!game) {
    return;
  }

  if (action === "toggle-map") {
    toggleMap();
    return;
  }

  if (game.isOver) {
    return;
  }

  if (action === "turn-left") {
    turnHero(-1);
  }

  if (action === "turn-right") {
    turnHero(1);
  }

  if (action === "turn-around") {
    turnHero(2);
  }

  if (action === "move-forward") {
    moveForward();
  }
}

function turnHero(change) {
  game.direction = (game.direction + change + directions.length) % directions.length;
  addMessage(`Du drejede og ser nu mod ${currentDirection().label.toLowerCase()}.`);
  renderGame();
}

function moveForward() {
  const next = tileInFront();
  const tile = game.tiles[next.y]?.[next.x];

  if (!tile || tile === "#") {
    addMessage("Av! Der er en grottevæg lige foran dig.");
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
  } else if (tile === "E") {
    game.isOver = true;
    addMessage("Du fandt udgangen og vandt AdventureQuest!");
  } else {
    addMessage("Du går forsigtigt frem gennem den mørke gang.");
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
    addMessage("Monsteret blev besejret! Du træder forbi det.");
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

function toggleMap() {
  game.isMapVisible = !game.isMapVisible;
  addMessage(game.isMapVisible ? "Du folder kortet ud." : "Du gemmer kortet væk.");
  renderGame();
}

function tileInFront() {
  const direction = currentDirection();

  return {
    x: game.position.x + direction.x,
    y: game.position.y + direction.y,
  };
}

function tileAtRelative(turnsFromForward) {
  const direction = directions[(game.direction + turnsFromForward + directions.length) % directions.length];

  return {
    direction,
    x: game.position.x + direction.x,
    y: game.position.y + direction.y,
    tile: game.tiles[game.position.y + direction.y]?.[game.position.x + direction.x],
  };
}

function currentDirection() {
  return directions[game.direction];
}

function addMessage(message) {
  game.messages = [message, ...game.messages].slice(0, 6);
}

function renderGame() {
  renderStats();
  renderScene();
  renderBoard();
  renderMapToggle();
  renderLog();
}

function renderStats() {
  statHero.textContent = game.hero.name;
  statHealth.textContent = `${game.health} / ${game.hero.health}`;
  statPower.textContent = game.hero.power;
  statTreasures.textContent = `${game.treasures} / ${treasureGoal}`;
  statDirection.textContent = currentDirection().label;
}

function renderScene() {
  const front = tileAtRelative(0);
  const scene = sceneForTile(front.tile);

  sceneImage.src = scene.image;
  sceneImage.alt = scene.alt;
  sceneTitle.textContent = scene.title;
  sceneDescription.textContent = scene.description;
  directionLabel.textContent = `Ser mod ${currentDirection().label.toLowerCase()}`;
  passageHints.innerHTML = passageHintMarkup();
}

function sceneForTile(tile) {
  if (!tile || tile === "#") {
    return {
      image: sceneImages.wall,
      alt: "En rå stenvæg stopper vejen",
      title: "En væg blokerer vejen",
      description: "Du kan ikke gå frem her. Drej helten for at kigge en anden vej.",
    };
  }

  if (tile === "M") {
    const monsterHealth = game.monsters[coordKey(tileInFront().x, tileInFront().y)];

    return {
      image: sceneImages.monster,
      alt: "Et grønt monster står i grottegangen",
      title: "Et monster står foran dig!",
      description: `Gå frem for at angribe. Monsterets liv: ${monsterHealth}.`,
    };
  }

  if (tile === "T") {
    return {
      image: sceneImages.treasure,
      alt: "En lysende skattekiste står i grotten",
      title: "Du ser en skat",
      description: "Gå frem for at samle skatten op.",
    };
  }

  if (tile === "E") {
    const isLocked = game.treasures < treasureGoal;

    return {
      image: sceneImages.exit,
      alt: "En lysende udgang for enden af grotten",
      title: isLocked ? "Udgangen er låst" : "Udgangen er åben!",
      description: isLocked
        ? `Du skal finde ${treasureGoal} skatte, før du kan gå ud.`
        : "Gå frem for at vinde spillet.",
    };
  }

  return {
    image: sceneImages.hallway,
    alt: "En mørk grottegang set indefra",
    title: "En uhyggelig gang fortsætter",
    description: "Du kan gå frem eller dreje for at se, hvad der er ved siden af dig.",
  };
}

function passageHintMarkup() {
  const hints = [
    ["Venstre", tileAtRelative(-1)],
    ["Frem", tileAtRelative(0)],
    ["Højre", tileAtRelative(1)],
  ];

  return hints
    .map(([label, info]) => `<span class="passage-hint">${label}: ${tileHint(info.tile)}</span>`)
    .join("");
}

function tileHint(tile) {
  return {
    "#": "væg",
    "T": "skat",
    "M": "monster",
    "E": "udgang",
    ".": "gang",
  }[tile] ?? "væg";
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
        cell.dataset.hero = currentDirection().symbol;
      } else {
        cell.textContent = tileText(tile);
      }

      board.appendChild(cell);
    });
  });
}

function renderMapToggle() {
  mapPanel.classList.toggle("is-hidden", !game.isMapVisible);
  mapToggle.textContent = game.isMapVisible ? "Gem kort" : "Vis kort";
  mapToggle.setAttribute(
    "aria-label",
    game.isMapVisible ? "Gem kortet over grotten" : "Vis kortet over grotten",
  );
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
    return `Helten ${game.hero.name}, ser mod ${currentDirection().label}`;
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

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => performAction(button.dataset.action));
});

document.addEventListener("keydown", (event) => {
  const actionByKey = {
    ArrowUp: "move-forward",
    w: "move-forward",
    W: "move-forward",
    ArrowLeft: "turn-left",
    a: "turn-left",
    A: "turn-left",
    ArrowRight: "turn-right",
    d: "turn-right",
    D: "turn-right",
    ArrowDown: "turn-around",
    m: "toggle-map",
    M: "toggle-map",
  };

  const action = actionByKey[event.key];

  if (action) {
    event.preventDefault();
    performAction(action);
  }
});

restartButton.addEventListener("click", restartGame);
mapToggle.addEventListener("click", () => performAction("toggle-map"));

renderHeroPicker();
