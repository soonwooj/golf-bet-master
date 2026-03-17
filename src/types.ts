
export interface HoleScore {
  holeNumber: number;
  par: number;
  score: number;
}

export interface Player {
  id: string;
  name: string;
  handicap: number;
  scores: HoleScore[];
}

export interface BetSettings {
  perStrokeAmount: number;
  birdieAmount: number;
  
  // Rules
  doubleOnTripleBogey: boolean;
  doubleOnTieCount: number; // 2 or 3
  doubleNextOnAllTie: boolean;
}

export interface PayoutSummary {
  from: string;
  to: string;
  amount: number;
  reason?: string;
}

export interface PlayerTotal {
  name: string;
  netAmount: number;
}
