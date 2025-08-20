import { Player, Team, SKILL_VALUES, WeightSetings } from '../models/types';

// Helper to get random color names for teams
function getRandomColorNames(numTeams: number, COLOR_NAMES: string[]): string[] {
  const shuffled = [...COLOR_NAMES].sort(() => Math.random() - 0.5);
  if (numTeams <= COLOR_NAMES.length) {
    return shuffled.slice(0, numTeams);
  } else {
    // If more teams than colors, repeat colors as needed
    const result = [];
    for (let i = 0; i < numTeams; i++) {
      result.push(shuffled[i % COLOR_NAMES.length]);
    }
    return result;
  }
}

export function generateRandomTeams(players: Player[], numberOfTeams: number, COLOR_NAMES: string[]): Team[] {
  const numTeams = numberOfTeams;
  // Shuffle players
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  // Get random color names
  const colorNames = getRandomColorNames(numTeams, COLOR_NAMES);
  // Split into teams
  const teamsArr = Array.from({ length: numTeams }, (_, i) => ({
    id: (i + 1).toString(),
    name: colorNames[i],
    players: [] as Player[],
  }));
  shuffled.forEach((player, idx) => {
    teamsArr[idx % numTeams].players.push(player);
  });
  return teamsArr;
}

function getPlayerVector(player: Player, avgSize: number, players: Player[], weights: WeightSetings): number[] {
  let playerVector : number[] = [];
  // Normalize skill to [0,1]
  playerVector.push((SKILL_VALUES[player.skillLevel] / 4) * weights.skillLevel);
  if (!player.teammatePreference) {
    // Treat as if teammate preference was matched
    playerVector.push(1 * weights.teammatePreference);
  } else {
    if (!players.find(p => p.id === player.teammatePreference)){
      // No match so mark as a miss
      playerVector.push(0);
    } else {
      // matched so mark as fulfilled
      playerVector.push(1 * weights.teammatePreference);
    }
  }
  if (!player.teamSizePreference || player.teamSizePreference === 'Any') {
    // Treat as preference matched
    playerVector.push(1 * weights.teamSizePreference);
  } else {
    const prefSize = player.teamSizePreference === 'Small' ? Math.max(2, Math.floor(avgSize)) : Math.ceil(avgSize);
    playerVector.push((prefSize / (2 * avgSize)) * weights.teamSizePreference); // normalized
  }
  return playerVector;
}

function randomVector(dim: number): number[] {
  return Array.from({ length: dim }, () => Math.random());
}

function meanVector(vectors: number[][]): number[] {
  if (vectors.length === 0) return [];
  const dim = vectors[0].length;
  const sum = Array(dim).fill(0);
  for (const v of vectors) for (let i = 0; i < dim; i++) sum[i] += v[i];
  return sum.map(x => x / vectors.length);
}

function euclideanSquared(a: number[], b: number[]): number {
  return a.reduce((sum, ai, i) => sum + (ai - b[i]) ** 2, 0);
}

export function createBalancedTeams(players: Player[], config: { numberOfTeams: number, weights: WeightSetings }, COLOR_NAMES: string[]): Team[] {
  const teamCount = config.numberOfTeams;
  const teamSize = players.length / teamCount;
  const minTeamSize = Math.floor(teamSize);
  const maxTeamSize = Math.ceil(teamSize);
  const avgSize = teamSize;
  const weights = config.weights;
  // Get random color names
  const colorNames = getRandomColorNames(teamCount, COLOR_NAMES);
  // Step 1: Shuffle players
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  // Step 2: Player vectors
  const playerVectors = shuffled.map(p => getPlayerVector(p, avgSize, players, weights));
  // Step 3: Random team centers
  let teamCenters = Array.from({ length: teamCount }, () => randomVector(3));
  // Step 4: Greedy assignment
  const teams: Team[] = Array.from({ length: teamCount }, (_, i) => ({
    id: (i + 1).toString(),
    name: colorNames[i],
    players: [] as Player[],
  }));
  for (let i = 0; i < shuffled.length; i++) {
    const p = shuffled[i];
    const v = playerVectors[i];
    // Find eligible teams (not at max size)
    const eligible = teams.map((t, idx) => ({ t, idx })).filter(({ t }) => t.players.length < maxTeamSize);
    // Find closest team center
    let minDist = Infinity;
    let bestTeams: number[] = [];
    for (const { t, idx } of eligible) {
      const dist = euclideanSquared(v, teamCenters[idx]);
      if (dist < minDist) {
        minDist = dist;
        bestTeams = [idx];
      } else if (dist === minDist) {
        bestTeams.push(idx);
      }
    }
    // Random tie-break
    const chosenIdx = bestTeams[Math.floor(Math.random() * bestTeams.length)];
    teams[chosenIdx].players.push(p);
    // Update team center
    const vectors = teams[chosenIdx].players.map(pl => getPlayerVector(pl, avgSize, players, weights));
    teamCenters[chosenIdx] = meanVector(vectors);
  }
  // Step 5: Final team size balancing (ensure max-min <= 1)
  let sizes = teams.map(t => t.players.length);
  let maxSizeNow = Math.max(...sizes);
  let minSizeNow = Math.min(...sizes);
  while (maxSizeNow - minSizeNow > 1) {
    const largest = teams.find(t => t.players.length === maxSizeNow)!;
    const smallest = teams.find(t => t.players.length === minSizeNow)!;
    // Move a random player from largest to smallest
    const idx = Math.floor(Math.random() * largest.players.length);
    const [moved] = largest.players.splice(idx, 1);
    smallest.players.push(moved);
    sizes = teams.map(t => t.players.length);
    maxSizeNow = Math.max(...sizes);
    minSizeNow = Math.min(...sizes);
  }
  return teams;
}

// Make balanced teams based on average team skill first, then take into account the player preferences
export function generateSnakeDraftTeams(players: Player[], config: { numberOfTeams: number, weights: WeightSetings }, COLOR_NAMES: string[]): Team[] {
  const numberOfTeams = config.numberOfTeams;

  // Get Team color and name
  const colorNames = getRandomColorNames(numberOfTeams, COLOR_NAMES);

  // Sort players based on skill
  let sortedPlayers: Player[] = [...players];
  sortedPlayers.sort((a, b) => {
    const diff = SKILL_VALUES[b.skillLevel] - SKILL_VALUES[a.skillLevel];
    if (diff === 0) return Math.random() - 0.5;
    return diff;
  });

  // Generate empty set of teams
  const teams: Team[] = Array.from({ length: numberOfTeams }, (_, i) => ({
    id: (i + 1).toString(),
    name: colorNames[i],
    players: [] as Player[],
  }));

  // Assign players in snake draft order
  for (let i = 0; i < sortedPlayers.length; i++) {
    const player = sortedPlayers[i];
    if (i % numberOfTeams == 0) {
      teams.reverse();
    }
    const currTeam = teams[i % numberOfTeams];
    currTeam.players.push(player);
  }

  return teams;

}

// Optional: multi-run optimization
export function generateBestTeamSet(players: Player[], config: { numberOfTeams: number, weights: WeightSetings }, COLOR_NAMES: string[], runs = 5): Team[] {
  let bestTeams: Team[] = [];
  let bestScore = Infinity;
  for (let i = 0; i < runs; i++) {
    const teams = createBalancedTeams(players, config, COLOR_NAMES);
    // Score: skill variance + (1 - teammate match ratio)
    const skillMeans = teams.map(t => t.players.reduce((sum, p) => sum + SKILL_VALUES[p.skillLevel], 0) / (t.players.length || 1));
    const skillVar = skillMeans.reduce((sum, m) => sum + (m - (skillMeans.reduce((a, b) => a + b, 0) / skillMeans.length)) ** 2, 0) / skillMeans.length;
    let teammateMatches = 0, teammateTotal = 0;
    for (const t of teams) {
      for (const p of t.players) {
        if (p.teammatePreference) {
          teammateTotal++;
          if (t.players.some(tp => tp.id === p.teammatePreference)) teammateMatches++;
        }
      }
    }
    const teammateScore = teammateTotal ? 1 - teammateMatches / teammateTotal : 1;
    const score = skillVar + teammateScore;
    if (score < bestScore) {
      bestScore = score;
      bestTeams = teams;
    }
  }
  return bestTeams;
} 