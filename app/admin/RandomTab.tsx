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
    if (players.length < 3) {
      alert("ผู้ผ่านไม่ถึง 3 คน");
      return;
    }

    setRolling(true);

    let i = 0;

    const interval = setInterval(() => {
      setCurrentName(
        players[i % players.length].players?.name || ""
      );
      i++;
    }, 40);

    setTimeout(() => {
      clearInterval(interval);

      const shuffled = [...players]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      setDrawnWinners(shuffled);

      setCurrentName(
        shuffled[0]?.players?.name || ""
      );

      setRolling(false);
    }, 1800);
  };

  const publishWinners = async () => {
    if (drawnWinners.length !== 3) {
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
      .insert([
        {
          player_id: drawnWinners[0].players.id,
          rank: 1,
        },
        {
          player_id: drawnWinners[1].players.id,
          rank: 2,
        },
        {
          player_id: drawnWinners[2].players.id,
          rank: 3,
        },
      ]);

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

      {drawnWinners.length === 3 && (
        <>
          <div className="bg-white rounded-xl">
            <p className="mb-3 text-sm text-gray-500">
              ผลการสุ่ม
            </p>

            <div className="divide-y">
              <button className="flex justify-between w-full py-3 text-left">
                <span>{drawnWinners[0].players.name}</span>
                <span className="text-xs text-gray-400">
                  {drawnWinners[0].players.student_id}
                </span>
              </button>

              <button className="flex justify-between w-full py-3 text-left">
                <span>{drawnWinners[1].players.name}</span>
                <span className="text-xs text-gray-400">
                  {drawnWinners[1].players.student_id}
                </span>
              </button>

              <button className="flex justify-between w-full py-3 text-left">
                <span>{drawnWinners[2].players.name}</span>
                <span className="text-xs text-gray-400">
                  {drawnWinners[2].players.student_id}
                </span>
              </button>
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