import { Player, Team, SKILL_VALUES } from '../models/types';
import { SORT_OPTIONS, DEFAULT_RANKING_PREFERENCES } from './constants';

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

export function generateRandomTeams(players: Player[], sessionPlayerIds: string[], numberOfNets: number, COLOR_NAMES: string[]): Team[] {
  if (sessionPlayerIds.length === 0 || numberOfNets < 1) return [];
  const numTeams = 2 * numberOfNets;
  const sessionPlayers = players.filter(p => sessionPlayerIds.includes(p.id));
  // Shuffle players
  const shuffled = [...sessionPlayers].sort(() => Math.random() - 0.5);
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

const scoringFunctions = {
  skill: (p: Player, T: Team, avgSkill: number) => {
    const projectedAvg = (T.players.reduce((sum: number, pl: Player) => sum + SKILL_VALUES[pl.skillLevel], 0) + SKILL_VALUES[p.skillLevel]) / (T.players.length + 1);
    return 1 - Math.abs(projectedAvg - avgSkill) / 2;
  },
  size: (p: Player, T: Team, minTeamSize: number, maxTeamSize: number) => {
    if (!p.teamSizePreference || p.teamSizePreference === 'Any') return 1;
    const pref = p.teamSizePreference === 'Small' ? minTeamSize : maxTeamSize;
    const delta = Math.abs((T.players.length + 1) - pref);
    let score = 1 - (delta / maxTeamSize);
    if (T.players.length > 0) {
      const samePrefCount = T.players.filter(tp => tp.teamSizePreference === p.teamSizePreference).length;
      if (samePrefCount / T.players.length > 0.5) score += 0.1;
    }
    return Math.min(score, 1);
  },
  teammate: (p: Player, T: Team) => {
    if (!p.teammatePreference) return 0;
    return T.players.some(t => t.id === p.teammatePreference) ? 1 : 0;
  },
};

function preferenceScore(player: Player, team: Team, preferenceOrder: string[], avgSkill: number, minTeamSize: number, maxTeamSize: number): number[] {
  return preferenceOrder.map(pref => {
    if (pref === 'skill') {
      if (team.players.length === 0) return 0.5;
      const teamAvg = team.players.reduce((sum, p) => sum + SKILL_VALUES[p.skillLevel], 0) / team.players.length;
      return 1 - Math.abs(teamAvg - avgSkill) / 2;
    } else if (pref === 'teammate') {
      if (!player.teammatePreference) return 0;
      return team.players.some(t => t.id === player.teammatePreference) ? 1 : 0;
    } else if (pref === 'size') {
      if (!player.teamSizePreference || player.teamSizePreference === 'Any') return 0.5;
      const prefSize = player.teamSizePreference === 'Small' ? minTeamSize : maxTeamSize;
      const delta = Math.abs(team.players.length - prefSize);
      return 1 - (delta / maxTeamSize);
    }
    return 0;
  });
}

export function generateBalancedTeams(players: Player[], sessionPlayerIds: string[], numberOfNets: number, settings: any, COLOR_NAMES: string[]): Team[] {
  if (sessionPlayerIds.length === 0 || numberOfNets < 1) return [];
  const teamCount = 2 * numberOfNets;
  const sessionPlayers: Player[] = players.filter(p => sessionPlayerIds.includes(p.id));
  const totalPlayers = sessionPlayers.length;
  const minTeamSize = Math.floor(totalPlayers / teamCount);
  const maxTeamSize = Math.ceil(totalPlayers / teamCount);
  const colorNames = getRandomColorNames(teamCount, COLOR_NAMES);
  const avgSkill = sessionPlayers.reduce((sum: number, p: Player) => sum + SKILL_VALUES[p.skillLevel], 0) / totalPlayers;
  const preferenceOrder: string[] = settings.sortingPreferences || DEFAULT_RANKING_PREFERENCES;
  // Step 1: Sort players by first preference
  let sortedPlayers: Player[] = [...sessionPlayers];
  if (preferenceOrder[0] === 'skill') {
    sortedPlayers.sort((a, b) => {
      const diff = SKILL_VALUES[b.skillLevel] - SKILL_VALUES[a.skillLevel];
      if (diff === 0) return Math.random() - 0.5;
      return diff;
    });
  } else if (preferenceOrder[0] === 'teammate') {
    // Prioritize players with a preferred teammate in the pool
    sortedPlayers.sort((a, b) => {
      const aHas = a.teammatePreference && sessionPlayers.some(p => p.id === a.teammatePreference) ? 1 : 0;
      const bHas = b.teammatePreference && sessionPlayers.some(p => p.id === b.teammatePreference) ? 1 : 0;
      if (bHas === aHas) return Math.random() - 0.5;
      return bHas - aHas;
    });
  } else if (preferenceOrder[0] === 'size') {
    sortedPlayers.sort((a, b) => {
      const aPref = a.teamSizePreference === 'Small' ? 0 : a.teamSizePreference === 'Large' ? 2 : 1;
      const bPref = b.teamSizePreference === 'Small' ? 0 : b.teamSizePreference === 'Large' ? 2 : 1;
      if (aPref === bPref) return Math.random() - 0.5;
      return aPref - bPref;
    });
  }
  // Step 2: Initial assignment (greedy by first preference)
  const teamsArr: Team[] = Array.from({ length: teamCount }, (_, i) => ({
    id: (i + 1).toString(),
    name: colorNames[i],
    players: [] as Player[],
  }));
  for (const player of sortedPlayers) {
    // Find best team for this player by first preference
    let bestScore = -Infinity;
    let bestTeam = teamsArr[0];
    for (const team of teamsArr) {
      if (team.players.length >= maxTeamSize) continue;
      const score = preferenceScore(player, team, [preferenceOrder[0]], avgSkill, minTeamSize, maxTeamSize)[0];
      // For teammate, if preferred teammate is already assigned, boost score
      if (preferenceOrder[0] === 'teammate' && player.teammatePreference && team.players.some(p => p.id === player.teammatePreference)) {
        // Already handled in scoring, but could add extra boost if desired
      }
      if (score > bestScore) {
        bestScore = score;
        bestTeam = team;
      }
    }
    bestTeam.players.push(player);
  }
  // Step 3: Swap optimization loop
  let improved = true;
  let iteration = 0;
  const MAX_ITERATIONS = 1000;
  while (improved && iteration < MAX_ITERATIONS) {
    improved = false;
    iteration++;
    for (let i = 0; i < teamsArr.length; i++) {
      for (let j = i + 1; j < teamsArr.length; j++) {
        const teamA = teamsArr[i];
        const teamB = teamsArr[j];
        for (let a = 0; a < teamA.players.length; a++) {
          for (let b = 0; b < teamB.players.length; b++) {
            const playerA = teamA.players[a];
            const playerB = teamB.players[b];
            // Simulate swap
            if (teamA.players.length === minTeamSize && teamB.players.length === maxTeamSize) continue;
            if (teamB.players.length === minTeamSize && teamA.players.length === maxTeamSize) continue;
            // Evaluate pre-swap
            const aPrefBefore = preferenceScore(playerA, teamA, preferenceOrder, avgSkill, minTeamSize, maxTeamSize);
            const bPrefBefore = preferenceScore(playerB, teamB, preferenceOrder, avgSkill, minTeamSize, maxTeamSize);
            // Evaluate post-swap
            const aPrefAfter = preferenceScore(playerA, teamB, preferenceOrder, avgSkill, minTeamSize, maxTeamSize);
            const bPrefAfter = preferenceScore(playerB, teamA, preferenceOrder, avgSkill, minTeamSize, maxTeamSize);
            // Only allow swap if first preference is preserved or improved for both
            if (
              aPrefAfter[0] >= aPrefBefore[0] &&
              bPrefAfter[0] >= bPrefBefore[0]
            ) {
              // Perform swap
              teamA.players[a] = playerB;
              teamB.players[b] = playerA;
              improved = true;
              break;
            }
          }
          if (improved) break;
        }
        if (improved) break;
      }
      if (improved) break;
    }
  }
  if (iteration === MAX_ITERATIONS) {
    console.warn('Team optimization stopped early due to iteration limit.');
  }
  // Step 4: Final team size balancing
  let sizes = teamsArr.map(t => t.players.length);
  let maxSize = Math.max(...sizes);
  let minSize = Math.min(...sizes);
  while (maxSize - minSize > 1) {
    const largest = teamsArr.find(t => t.players.length === maxSize)!;
    const smallest = teamsArr.find(t => t.players.length === minSize)!;
    // Move lowest first-preference player from largest to smallest
    let minScore = Infinity;
    let minPlayerIdx = 0;
    for (let i = 0; i < largest.players.length; i++) {
      const p = largest.players[i];
      const score = preferenceScore(p, smallest, [preferenceOrder[0]], avgSkill, minTeamSize, maxTeamSize)[0];
      if (score < minScore) {
        minScore = score;
        minPlayerIdx = i;
      }
    }
    const [movedPlayer] = largest.players.splice(minPlayerIdx, 1);
    smallest.players.push(movedPlayer);
    sizes = teamsArr.map(t => t.players.length);
    maxSize = Math.max(...sizes);
    minSize = Math.min(...sizes);
  }
  return teamsArr;
}

function getPlayerVector(player: Player, avgSize: number, preferenceOrder: string[], players: Player[]): number[] {
  return preferenceOrder.map(pref => {
    if (pref === 'skill') {
      // Normalize skill to [0,1]
      return SKILL_VALUES[player.skillLevel] / 4;
    } else if (pref === 'teammate') {
      if (!player.teammatePreference) return 0;
      // 1 if preferred teammate is in the same team, 0 otherwise (for assignment, just 0)
      return 0;
    } else if (pref === 'size') {
      if (!player.teamSizePreference || player.teamSizePreference === 'Any') return 0.5;
      const prefSize = player.teamSizePreference === 'Small' ? Math.max(2, Math.floor(avgSize)) : Math.ceil(avgSize);
      return prefSize / (2 * avgSize); // normalized
    }
    return 0;
  });
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

export function createBalancedTeams(players: Player[], config: { numberOfNets: number, preferenceOrder: string[] }, COLOR_NAMES: string[]): Team[] {
  const teamCount = 2 * config.numberOfNets;
  const teamSize = players.length / teamCount;
  const minTeamSize = Math.floor(teamSize);
  const maxTeamSize = Math.ceil(teamSize);
  const avgSize = teamSize;
  const preferenceOrder = config.preferenceOrder;
  // Get random color names
  const colorNames = getRandomColorNames(teamCount, COLOR_NAMES);
  // Step 1: Shuffle players
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  // Step 2: Player vectors
  const playerVectors = shuffled.map(p => getPlayerVector(p, avgSize, preferenceOrder, players));
  // Step 3: Random team centers
  let teamCenters = Array.from({ length: teamCount }, () => randomVector(preferenceOrder.length));
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
    const vectors = teams[chosenIdx].players.map(pl => getPlayerVector(pl, avgSize, preferenceOrder, players));
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

// Optional: multi-run optimization
export function generateBestTeamSet(players: Player[], config: { numberOfNets: number, preferenceOrder: string[] }, COLOR_NAMES: string[], runs = 5): Team[] {
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