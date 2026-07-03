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
    <div className="min-h-screen p-6 bg-purple-50">
      <div className="max-w-md mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-4 text-sm">
            <Link
              href="/winners"
              className="font-semibold"
            >
              ประกาศผล
            </Link>

            <Link href="/result">
              ผลการทำแบบทดสอบ
            </Link>
          </div>

          <button
            onClick={logout}
            className="text-sm underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24">
              <path d="M0 0h24v24H0z" fill="none" />
              <path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h7v2H5v14h7v2zm11-4l-1.375-1.45l2.55-2.55H9v-2h8.175l-2.55-2.55L16 7l5 5z" />
            </svg>
          </button>
        </div>


        <div className="space-y-2">
          {winners.map((winner) => {
            const isMe =
              winner.players.student_id === myStudentId;

            return (
              <div
                key={winner.rank}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition
        ${isMe
                    ? "bg-yellow-100 border border-yellow-300"
                    : "bg-gray-50"
                  }`}
              >
                <div>
                  <p className="font-medium">
                    {isMe && ""}
                    {winner.players.name}
                  </p>

                  <p className="text-xs text-gray-400">
                    {winner.players.student_id}
                  </p>
                </div>

                <div className="text-sm font-semibold text-gray-500">
                  #{winner.rank}
                </div>
              </div>
            );
          })}
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