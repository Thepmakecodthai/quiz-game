"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
type WinnerRow = {
  rank: number;
  players: {
    id: number;
    name: string;
    student_id: string;
  };
};

export default function WinnersPage() {
  const [loading, setLoading] = useState(true);
  const [winners, setWinners] = useState<WinnerRow[]>([]);
  const router = useRouter();
  const [showCongrats, setShowCongrats] = useState(false);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myStudentId, setMyStudentId] = useState("");

  const logout = () => {
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("quizResult");
    router.push("/resume");
  };
  useEffect(() => {
    const user = sessionStorage.getItem("userData");

    if (!user) {
      router.replace("/resume");
      return;
    }
  }, [router]);
  useEffect(() => {
    const fetchWinners = async () => {
      const { data, error } = await supabase
        .from("winners")
        .select(`
        rank,
        players (
          id,
          name,
          student_id
        )
      `)
        .order("rank", { ascending: true });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const formatted: WinnerRow[] =
        (data || []).map((item: any) => ({
          ...item,
          players: Array.isArray(item.players)
            ? item.players[0]
            : item.players,
        }));

      setWinners(formatted);
      setLoading(false);
    };

    fetchWinners();
  }, []);

  useEffect(() => {
    if (winners.length === 0) return;

    const user = sessionStorage.getItem("userData");

    if (!user) return;

    const studentId = JSON.parse(user).student_id;

    const winner = winners.find(
      (w) => w.players.student_id === studentId
    );

    if (winner) {
      setMyRank(winner.rank);
      setShowCongrats(true);
    }
  }, [winners]);
  useEffect(() => {
    const user = sessionStorage.getItem("userData");

    if (!user) return;

    setMyStudentId(
      JSON.parse(user).student_id
    );
  }, []);


  return (
    <div className="relative p-6 overflow-hidden min-h-dvh bg-purple-50">
      <img
        src="/images/up16.png"
        alt=""
        className="absolute bottom-4 left-1/2 w-72 -translate-x-1/2 opacity-[0.1] pointer-events-none"
      />
      <div className="max-w-md mx-auto">

        <div className="flex justify-end mb-4">
          <button
            onClick={logout}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24">
              <path d="M0 0h24v24H0z" fill="none" />
              <path fill="#C70000" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h7v2H5v14h7v2zm11-4l-1.375-1.45l2.55-2.55H9v-2h8.175l-2.55-2.55L16 7l5 5z" />
            </svg>
          </button>
        </div>


        <div className="p-5 bg-white border border-purple-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] rounded-3xl">
          <h2 className="mb-5 text-lg font-semibold text-center text-gray-800">
            ประกาศผลผู้ได้รับรางวัล
          </h2>

          <div className="space-y-2">
            {winners.map((winner) => {
              const isMe =
                winner.players.student_id === myStudentId;

              return (
                <div
                  key={winner.rank}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border
          ${isMe
                      ? "bg-yellow-50 border-yellow-300"
                      : "bg-gray-50 border-gray-200"
                    }`}
                >
                  <div>
                    <p className="font-medium">
                      {winner.players.name}
                    </p>

                    <p className="text-xs text-gray-400">
                      {winner.players.student_id}
                    </p>
                  </div>

                  <div className="text-sm font-bold text-purple-600">
                    #{winner.rank}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-5">
          <Link
            href="/result"
            className="block py-2.5 text-center text-sm font-medium text-gray-700 bg-white rounded-xl border border-gray-200"
          >
            ดูผลการทำแบบทดสอบ
          </Link>
        </div>

      </div>
      {showCongrats && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 bg-black/40"
          onClick={() => setShowCongrats(false)}
        >
          <div
            className="w-full max-w-sm p-6 text-center bg-white rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 text-5xl">
              🎉
            </div>

            <h2 className="mb-2 text-xl font-semibold">
              ยินดีด้วย
            </h2>

            <p className="text-gray-600">
              ทางเราจะติดต่อคุณไปทางเบอร์โทรศัพท์
            </p>

            <button
              onClick={() => setShowCongrats(false)}
              className="w-full py-2 mt-6 text-white bg-purple-600 rounded-lg"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}