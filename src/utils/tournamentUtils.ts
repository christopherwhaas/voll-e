import { Team, Tournament, TournamentSettings, TournamentRound, Match, TournamentTeam } from '../models/types';

// Helper to create TournamentTeam from Team
const toTournamentTeam = (team: Team): TournamentTeam => ({
  ...team,
  losses: 0,
});

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// --- Bracket Types ---
export type BracketType = 'winner' | 'loser' | 'final';

// --- Bracket Generation ---
export function generateBrackets(
  teams: Team[],
  settings: TournamentSettings
): TournamentRound[] {
  const shuffledTeams = shuffleArray(teams.map(toTournamentTeam));
  const rounds: TournamentRound[] = [];

  if (!settings.doubleElimination) {
    // Single Elimination: one bracket ('winner')
    let currentTeams = shuffledTeams;
    let roundNumber = 1;
    while (currentTeams.length > 1) {
      const matches: Match[] = [];
      for (let i = 0; i < currentTeams.length; i += 2) {
        const team1 = currentTeams[i];
        const team2 = currentTeams[i + 1];
        matches.push({
          id: `winner_r${roundNumber}_m${i / 2 + 1}`,
          team1Id: team1.id,
          team2Id: team2 ? team2.id : '',
          team1Wins: 0,
          team2Wins: 0,
          isComplete: false,
          round: roundNumber,
          bracket: 'winner',
          matchNumber: i / 2 + 1,
        });
      }
      rounds.push({
        roundNumber,
        bracket: 'winner',
        matches,
        isComplete: false,
      });
      currentTeams = matches.map(m => ({ id: '', name: '', players: [], losses: 0 })); // Placeholder for next round
      roundNumber++;
      if (matches.length === 1) break; // Final round
    }
    return rounds;
  }

  // Double Elimination: winner, loser, final
  // 1. Winner Bracket
  let winnerTeams = shuffledTeams;
  let winnerRoundNumber = 1;
  let loserRoundNumber = 1;
  let loserTeams: TournamentTeam[] = [];
  let winnerRounds: TournamentRound[] = [];
  let loserRounds: TournamentRound[] = [];

  // Generate winner bracket rounds
  while (winnerTeams.length > 1) {
    const matches: Match[] = [];
    for (let i = 0; i < winnerTeams.length; i += 2) {
      const team1 = winnerTeams[i];
      const team2 = winnerTeams[i + 1];
      matches.push({
        id: `winner_r${winnerRoundNumber}_m${i / 2 + 1}`,
        team1Id: team1.id,
        team2Id: team2 ? team2.id : '',
        team1Wins: 0,
        team2Wins: 0,
        isComplete: false,
        round: winnerRoundNumber,
        bracket: 'winner',
        matchNumber: i / 2 + 1,
      });
    }
    winnerRounds.push({
      roundNumber: winnerRoundNumber,
      bracket: 'winner',
      matches,
      isComplete: false,
    });
    // Losers from this round go to loser bracket
    loserTeams = loserTeams.concat(matches.map(m => ({ id: '', name: '', players: [], losses: 1 }))); // Placeholder
    winnerTeams = matches.map(m => ({ id: '', name: '', players: [], losses: 0 })); // Placeholder for next round
    winnerRoundNumber++;
    if (matches.length === 1) break; // Final winner round
  }
  // Loser bracket rounds (structure only; actual teams filled in as matches are played)
  // Final round (structure only)
  // These will be filled in by progression logic
  return [...winnerRounds, ...loserRounds];
}

// --- Progression Logic ---
export function progressTournament(
  tournament: Tournament,
  matchId: string,
  winningTeamId: string
): Tournament {
  // Deep copy to avoid mutating original
  const updatedTournament: Tournament = JSON.parse(JSON.stringify(tournament));
  const { settings } = updatedTournament;
  const matchesToWin = settings.preliminaryMatchesPerRound;
  const finalsToWin = settings.championshipMatchesPerRound;

  // Find the match and round
  let match: Match | undefined;
  let round: TournamentRound | undefined;
  for (const r of updatedTournament.rounds) {
    match = r.matches.find(m => m.id === matchId);
    if (match) {
      round = r;
      break;
    }
  }
  if (!match || !round) return updatedTournament;

  // Update match result
  if (match.team1Id === winningTeamId) {
    match.team1Wins++;
  } else if (match.team2Id === winningTeamId) {
    match.team2Wins++;
  }

  // Determine if match is complete
  const requiredWins = round.bracket === 'final' ? finalsToWin : matchesToWin;
  if (match.team1Wins >= requiredWins || match.team2Wins >= requiredWins) {
    match.isComplete = true;
    match.winnerId = match.team1Wins >= requiredWins ? match.team1Id : match.team2Id;
    const loserId = match.team1Wins >= requiredWins ? match.team2Id : match.team1Id;
    const winnerId = match.winnerId;
    // Update team losses
    const loserTeam = updatedTournament.teams.find(t => t.id === loserId);
    if (loserTeam) loserTeam.losses++;

    // --- SINGLE ELIMINATION ---
    if (!settings.doubleElimination) {
      // Advance winner to next round
      const currentRoundIdx = updatedTournament.rounds.findIndex(r => r.roundNumber === round!.roundNumber && r.bracket === 'winner');
      const nextRound = updatedTournament.rounds.find(r => r.roundNumber === round!.roundNumber + 1 && r.bracket === 'winner');
      if (nextRound) {
        // Find the next match for this winner
        // Place winner in the correct slot (team1 or team2) based on matchNumber parity
        const nextMatchIdx = Math.floor((match.matchNumber - 1) / 2);
        const nextMatch = nextRound.matches[nextMatchIdx];
        if (nextMatch) {
          // If both slots are empty, place in team1; if one is filled, fill the other
          if (!nextMatch.team1Id) {
            nextMatch.team1Id = winnerId;
          } else if (!nextMatch.team2Id) {
            nextMatch.team2Id = winnerId;
          }
        }
      } else {
        // If this was the last match, set tournament winner
        const teamsAlive = updatedTournament.teams.filter(t => t.losses === 0);
        if (teamsAlive.length === 1) {
          updatedTournament.isComplete = true;
          updatedTournament.winner = teamsAlive[0].id;
          // Find runner up (the other team in the final match)
          updatedTournament.runnerUp = loserId;
        }
      }
    } else {
      // --- DOUBLE ELIMINATION ---
      if (round.bracket === 'winner') {
        // Winner advances in winner bracket
        const nextWinnerRound = updatedTournament.rounds.find(r => r.roundNumber === round!.roundNumber + 1 && r.bracket === 'winner');
        if (nextWinnerRound) {
          const nextMatchIdx = Math.floor((match.matchNumber - 1) / 2);
          const nextMatch = nextWinnerRound.matches[nextMatchIdx];
          if (nextMatch) {
            if (!nextMatch.team1Id) {
              nextMatch.team1Id = winnerId;
            } else if (!nextMatch.team2Id) {
              nextMatch.team2Id = winnerId;
            }
          }
        }
        // Loser drops to loser bracket
        const loserRoundNum = round.roundNumber;
        let loserRound = updatedTournament.rounds.find(r => r.roundNumber === loserRoundNum && r.bracket === 'loser');
        if (!loserRound) {
          // Create new loser round if needed
          loserRound = {
            roundNumber: loserRoundNum,
            bracket: 'loser',
            matches: [],
            isComplete: false,
          };
          updatedTournament.rounds.push(loserRound);
        }
        // Find or create a match for the loser
        let loserMatch = loserRound.matches.find(m => !m.team1Id || !m.team2Id);
        if (!loserMatch) {
          loserMatch = {
            id: `loser_r${loserRoundNum}_m${loserRound.matches.length + 1}`,
            team1Id: '',
            team2Id: '',
            team1Wins: 0,
            team2Wins: 0,
            isComplete: false,
            round: loserRoundNum,
            bracket: 'loser',
            matchNumber: loserRound.matches.length + 1,
          };
          loserRound.matches.push(loserMatch);
        }
        if (!loserMatch.team1Id) {
          loserMatch.team1Id = loserId;
        } else if (!loserMatch.team2Id) {
          loserMatch.team2Id = loserId;
        }
      } else if (round.bracket === 'loser') {
        // Winner advances in loser bracket
        const nextLoserRound = updatedTournament.rounds.find(r => r.roundNumber === round!.roundNumber + 1 && r.bracket === 'loser');
        if (nextLoserRound) {
          const nextMatchIdx = Math.floor((match.matchNumber - 1) / 2);
          const nextMatch = nextLoserRound.matches[nextMatchIdx];
          if (nextMatch) {
            if (!nextMatch.team1Id) {
              nextMatch.team1Id = winnerId;
            } else if (!nextMatch.team2Id) {
              nextMatch.team2Id = winnerId;
            }
          }
        }
        // Loser is eliminated (losses incremented above)
      }
      // --- FINALS LOGIC ---
      // If only two teams remain, one with 0 losses, one with 1 loss, create finals
      const teamsAlive = updatedTournament.teams.filter(t => t.losses < 2);
      if (teamsAlive.length === 2 && !updatedTournament.rounds.some(r => r.bracket === 'final')) {
        const [teamA, teamB] = teamsAlive;
        const teamAObj = updatedTournament.teams.find(t => t.id === teamA.id);
        const teamBObj = updatedTournament.teams.find(t => t.id === teamB.id);
        if (teamAObj && teamBObj && teamAObj.losses !== teamBObj.losses) {
          // Create finals round
          updatedTournament.rounds.push({
            roundNumber: Math.max(...updatedTournament.rounds.map(r => r.roundNumber)) + 1,
            bracket: 'final',
            matches: [
              {
                id: `final_1`,
                team1Id: teamAObj.losses === 0 ? teamAObj.id : teamBObj.id,
                team2Id: teamAObj.losses === 1 ? teamAObj.id : teamBObj.id,
                team1Wins: 0,
                team2Wins: 0,
                isComplete: false,
                round: Math.max(...updatedTournament.rounds.map(r => r.roundNumber)) + 1,
                bracket: 'final',
                matchNumber: 1,
              },
            ],
            isComplete: false,
          });
        }
      }
      // Finals progression
      if (round.bracket === 'final') {
        // If the team from the loser bracket wins, and this is the first finals match, create a rematch
        const finalsMatches = round.matches;
        const team1 = updatedTournament.teams.find(t => t.id === match.team1Id);
        const team2 = updatedTournament.teams.find(t => t.id === match.team2Id);
        if (team1 && team2) {
          if (settings.doubleElimination && finalsMatches.length === 1 && team1.losses === 1 && team2.losses === 1) {
            // Both teams now have 1 loss, so this is the true final
            round.matches.push({
              id: `final_2`,
              team1Id: team1.id,
              team2Id: team2.id,
              team1Wins: 0,
              team2Wins: 0,
              isComplete: false,
              round: round.roundNumber,
              bracket: 'final',
              matchNumber: 2,
            });
          } else {
            // Tournament is complete
            updatedTournament.isComplete = true;
            updatedTournament.winner = match.winnerId;
            updatedTournament.runnerUp = match.team1Id === match.winnerId ? match.team2Id : match.team1Id;
          }
        }
      }
    }
  }
  return updatedTournament;
}

// Get current active matches
export const getActiveMatches = (tournament: Tournament): Match[] => {
  const activeMatches: Match[] = [];
  for (const round of tournament.rounds) {
    for (const match of round.matches) {
      if (!match.isComplete && match.team1Id && match.team2Id) {
        activeMatches.push(match);
      }
    }
  }
  return activeMatches;
};

// Get team by ID
export const getTeamById = (tournament: Tournament, teamId: string): TournamentTeam | undefined => {
  return tournament.teams.find(team => team.id === teamId);
};

// Get match by ID
export const getMatchById = (tournament: Tournament, matchId: string): Match | undefined => {
  for (const round of tournament.rounds) {
    const match = round.matches.find(m => m.id === matchId);
    if (match) return match;
  }
  return undefined;
};

// End tournament early
export const endTournament = (tournament: Tournament): Tournament => {
  return {
    ...tournament,
    isComplete: true,
  };
};

// Reset tournament
export const resetTournament = (tournament: Tournament): Tournament => {
  const rounds = generateBrackets(tournament.teams, tournament.settings);
  const resetTeams = tournament.teams.map(t => ({ ...t, losses: 0 }));
  return {
    ...tournament,
    rounds,
    teams: resetTeams,
    isComplete: false,
    winner: undefined,
    runnerUp: undefined,
  };
}; 