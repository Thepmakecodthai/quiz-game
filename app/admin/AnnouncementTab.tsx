"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type WinnerRow = {
  rank: number;
  players: {
    id: number;
    name: string;
    student_id: string;
    phone: string;
  };
};
export default function AnnouncementTab() {
  const [loading, setLoading] = useState(true);
  const [winners, setWinners] = useState<WinnerRow[]>([]);

  const fetchWinners = async () => {
    const { data, error } = await supabase
      .from("winners")
      .select(`
    rank,
    players (
      id,
      name,
      student_id,
      phone
    )
  `)


      .order("rank", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    const formatted =
      (data || []).map((item: any) => ({
        ...item,
        players: Array.isArray(item.players)
          ? item.players[0]
          : item.players,
      }));

    setWinners(formatted);
    setLoading(false);
  };

  useEffect(() => {
    fetchWinners();
  }, []);

  const clearWinners = async () => {
    const ok = confirm(
      "ต้องการล้างผลการประกาศทั้งหมดหรือไม่?"
    );

    if (!ok) return;

    const { data, error } = await supabase
      .from("winners")
      .delete()
      .gt("id", 0)
      .select();

    console.log("DELETE RESULT:", data);
    console.log("DELETE ERROR:", error);

    if (error) {
      alert(error.message);
      return;
    }

    await fetchWinners();

    alert("ล้างผลการประกาศสำเร็จ");
  };

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-xl">
        loading...
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-xl">
      <p className="mb-3 text-sm text-gray-500">
        ผลการประกาศ
      </p>

      {winners.length === 0 ? (
        <p className="text-sm text-gray-400">
          ยังไม่มีการประกาศผล
        </p>
      ) : (
        <>
          <div className="divide-y">
            {winners.map((winner) => (
              <div
                key={winner.rank}
                className="py-3"
              >
                <p className="font-medium">
                  #{winner.rank} {winner.players[0]?.name}
                </p>

                <p className="text-sm text-gray-500">
                  รหัสนิสิต: {winner.players[0]?.student_id}
                </p>

                <p className="text-sm text-gray-500">
                  เบอร์โทร: {winner.players[0]?.phone}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={clearWinners}
            className="w-full py-3 mt-4 text-white bg-red-600 rounded"
          >
            ล้างผลการประกาศ
          </button>
        </>
      )}
    </div>
  );
}