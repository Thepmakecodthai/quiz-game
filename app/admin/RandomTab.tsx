"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  players: any[];
  onPublished: () => void;
};

export default function RandomTab({
  players,
  onPublished,
}: Props) {
  const [rolling, setRolling] = useState(false);
  const [currentName, setCurrentName] = useState("");

  const [drawnWinners, setDrawnWinners] =
    useState<any[]>([]);

  const startRoll = () => {

    const eligiblePlayers = players.filter(
      (p) => p.score === 5
    );
    console.log(eligiblePlayers);

    if (eligiblePlayers.length < 5) {
      alert("ผู้ที่ได้ 5 คะแนนมีไม่ถึง 5 คน");
      return;
    }

    setRolling(true);

    let i = 0;

    const interval = setInterval(() => {
      setCurrentName(
        eligiblePlayers[i % eligiblePlayers.length]
          .players?.name || ""
      );
      i++;
    }, 40);

    setTimeout(() => {
      clearInterval(interval);

      const shuffled = [...eligiblePlayers]
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);

      setDrawnWinners(shuffled);

      setCurrentName(
        shuffled[0]?.players?.name || ""
      );

      setRolling(false);
    }, 1800);
  };

  const publishWinners = async () => {
    if (drawnWinners.length !== 5) {
      alert("กรุณาสุ่มก่อน");
      return;
    }

    const { error: deleteError } = await supabase
      .from("winners")
      .delete()
      .gt("id", 0);

    if (deleteError) {
      alert(deleteError.message);
      return;
    }

    const { error } = await supabase
      .from("winners")
      .insert(
        drawnWinners.map((winner, index) => ({
          player_id: winner.players.id,
          rank: index + 1,
        }))
      );

    if (error) {
      alert(error.message);
      return;
    }


    alert("ประกาศผลสำเร็จ");
    onPublished();
  };

  return (
    <div className="p-6 bg-white rounded-xl">

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          สุ่มผู้ชนะ
        </p>

        <button
          onClick={startRoll}
          disabled={rolling}
          className="px-4 py-2 text-white bg-black rounded disabled:opacity-40"
        >
          {rolling ? "กำลังสุ่ม..." : "เริ่มสุ่ม"}
        </button>
      </div>

      <div className="py-8 text-center">
        <p className="text-3xl font-semibold">
          {currentName || "—"}
        </p>
      </div>

      {drawnWinners.length > 0 && (
        <>
          <div className="bg-white rounded-xl">
            <p className="mb-3 text-sm text-gray-500">
              ผลการสุ่ม
            </p>

            <div className="divide-y">
              {drawnWinners.map((winner, index) => (
                <div
                  key={winner.players.id}
                  className="flex justify-between py-3"
                >
                  <span>
                    #{index + 1} {winner.players.name}
                  </span>

                  <span className="text-xs text-gray-400">
                    {winner.players.student_id}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={publishWinners}
            className="w-full py-3 mt-4 text-white bg-black rounded"
          >
            ประกาศผล
          </button>
        </>
      )}
    </div>
  );
}