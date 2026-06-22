import { api } from "./api.service";
import type { MyRewardsResponse, LeaderboardEntry } from "@/src/types";

export const rewardService = {
  /** Get the logged-in user's balance, earnings & withdrawal history */
  getMyRewards: (token: string) =>
    api.get<MyRewardsResponse>("/rewards", token),

  /** Request a cash withdrawal (minimum 100 BHD) */
  requestWithdrawal: (token: string, amountBHD: number) =>
    api.post<{ message: string; balance: number }>(
      "/rewards/withdraw",
      { amountBHD },
      token,
    ),

  /** Get the top users by total BHD earned */
  getLeaderboard: () => api.get<LeaderboardEntry[]>("/rewards/leaderboard"),
};
