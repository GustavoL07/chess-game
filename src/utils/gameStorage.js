// Partidas terminadas, guardadas no navegador (mais recente primeiro).
// Cada partida: { id, date, moves: [SAN...], result, playerColor, level }
const STORAGE_KEY = "chess-games";
export const MAX_SAVED_GAMES = 200;

function isValid(game) {
  return (
    game &&
    typeof game.id === "string" &&
    typeof game.date === "number" &&
    Array.isArray(game.moves) &&
    game.result &&
    (game.result.type === "win" || game.result.type === "draw") &&
    (game.playerColor === "w" || game.playerColor === "b")
  );
}

export function loadGames() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved.filter(isValid) : [];
  } catch {
    return [];
  }
}

function persist(games) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  } catch {
    // armazenamento indisponível ou cheio: segue sem salvar
  }
}

export function saveGame(game) {
  const others = loadGames().filter((g) => g.id !== game.id);
  persist([game, ...others].slice(0, MAX_SAVED_GAMES));
}

export function deleteGame(id) {
  persist(loadGames().filter((g) => g.id !== id));
}
