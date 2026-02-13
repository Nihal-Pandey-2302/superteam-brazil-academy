"use client";

import { useEffect, useState } from 'react';
import { ProgressService, User } from '@/services/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallet } from '@solana/wallet-adapter-react';
import { cn } from '@/lib/utils'; // function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const { publicKey } = useWallet();

  useEffect(() => {
    ProgressService.getLeaderboard()
      .then(setLeaderboard)
      .catch(console.error);
  }, []);

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-[#9945FF] to-[#14F195]">
        Solanaut Leaderboard
      </h1>

      <div className="max-w-4xl mx-auto">
        <Card className="bg-[#0A0A0F] border-[#2E2E36]">
          <CardContent className="p-0">
            {leaderboard.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Loading rankings...</div>
            ) : (
                <div className="divide-y divide-[#2E2E36]">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-4 p-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                        <div className="col-span-1 text-center">#</div>
                        <div className="col-span-1"></div>
                        <div className="col-span-6">User</div>
                        <div className="col-span-2 text-right">XP</div>
                        <div className="col-span-2 text-right">Level</div>
                    </div>

                    {leaderboard.map((user, index) => {
                        const isMe = publicKey && user.walletAddress === publicKey.toString();
                        const rank = index + 1;
                        let rankColor = "text-gray-400";
                        if (rank === 1) rankColor = "text-yellow-400";
                        if (rank === 2) rankColor = "text-gray-300";
                        if (rank === 3) rankColor = "text-amber-600";

                        return (
                            <div key={user.walletAddress} className={cn(
                                "grid grid-cols-12 gap-4 p-4 items-center transition-colors hover:bg-[#1E1E24]",
                                isMe && "bg-[#1E1E24]/50 border-l-2 border-[#14F195]"
                            )}>
                                <div className={cn("col-span-1 text-center font-bold text-lg", rankColor)}>
                                    {rank}
                                </div>
                                <div className="col-span-1 flex justify-center">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#9945FF] to-[#14F195] p-[1px]">
                                        <div className="w-full h-full rounded-full bg-[#0A0A0F] flex items-center justify-center text-xs">
                                            👨‍🚀
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-6 truncate">
                                    <div className={cn("font-medium", isMe ? "text-[#14F195]" : "text-white")}>
                                        {user.username || user.walletAddress.slice(0, 8) + "..."}
                                    </div>
                                    {isMe && <div className="text-xs text-gray-500">That's you!</div>}
                                </div>
                                <div className="col-span-2 text-right font-mono text-[#14F195]">
                                    {user.xp.toLocaleString()} XP
                                </div>
                                <div className="col-span-2 text-right text-gray-400">
                                    Lvl {user.level}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
