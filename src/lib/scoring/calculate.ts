import { SCORING, SESSION_TYPES, type SessionType } from "./rules";

export interface PredictionData {
  p1DriverId: string;
  p2DriverId: string | null;
  p3DriverId: string | null;
}

export interface ResultData {
  p1DriverId: string;
  p2DriverId: string | null;
  p3DriverId: string | null;
}

export interface ScoreBreakdown {
  p1: "exact" | "top3" | "miss";
  p2?: "exact" | "top3" | "miss";
  p3?: "exact" | "top3" | "miss";
  allExactBonus: boolean;
}

export interface ScoreResult {
  basePoints: number;
  bonusPoints: number;
  totalPoints: number;
  breakdown: ScoreBreakdown;
}

export function calculateScore(
  prediction: PredictionData,
  result: ResultData,
  sessionType: SessionType
): ScoreResult {
  if (sessionType === SESSION_TYPES.QUALIFYING) {
    return calculateQualifyingScore(prediction, result);
  }
  return calculateRaceScore(prediction, result, sessionType);
}

function calculateQualifyingScore(
  prediction: PredictionData,
  result: ResultData
): ScoreResult {
  const isExact = prediction.p1DriverId === result.p1DriverId;
  const basePoints = isExact ? SCORING.qualifying.exactPole : 0;

  return {
    basePoints,
    bonusPoints: 0,
    totalPoints: basePoints,
    breakdown: {
      p1: isExact ? "exact" : "miss",
      allExactBonus: false,
    },
  };
}

function calculateRaceScore(
  prediction: PredictionData,
  result: ResultData,
  sessionType: SessionType
): ScoreResult {
  const rules =
    sessionType === SESSION_TYPES.SPRINT ? SCORING.sprint : SCORING.race;

  const resultTop3 = [result.p1DriverId, result.p2DriverId, result.p3DriverId];

  let basePoints = 0;
  const breakdown: ScoreBreakdown = {
    p1: "miss",
    p2: "miss",
    p3: "miss",
    allExactBonus: false,
  };

  // P1
  if (prediction.p1DriverId === result.p1DriverId) {
    basePoints += rules.exactPosition;
    breakdown.p1 = "exact";
  } else if (resultTop3.includes(prediction.p1DriverId)) {
    basePoints += rules.inTopThree;
    breakdown.p1 = "top3";
  }

  // P2
  if (prediction.p2DriverId && result.p2DriverId) {
    if (prediction.p2DriverId === result.p2DriverId) {
      basePoints += rules.exactPosition;
      breakdown.p2 = "exact";
    } else if (resultTop3.includes(prediction.p2DriverId)) {
      basePoints += rules.inTopThree;
      breakdown.p2 = "top3";
    }
  }

  // P3
  if (prediction.p3DriverId && result.p3DriverId) {
    if (prediction.p3DriverId === result.p3DriverId) {
      basePoints += rules.exactPosition;
      breakdown.p3 = "exact";
    } else if (resultTop3.includes(prediction.p3DriverId)) {
      basePoints += rules.inTopThree;
      breakdown.p3 = "top3";
    }
  }

  // Bonus: all three exact
  let bonusPoints = 0;
  if (
    breakdown.p1 === "exact" &&
    breakdown.p2 === "exact" &&
    breakdown.p3 === "exact"
  ) {
    bonusPoints = SCORING.bonus.allThreeExact;
    breakdown.allExactBonus = true;
  }

  return {
    basePoints,
    bonusPoints,
    totalPoints: basePoints + bonusPoints,
    breakdown,
  };
}
