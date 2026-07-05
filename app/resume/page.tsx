"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
export default function ResumePage() {
  const router = useRouter();

  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!studentId.trim()) {
      setError("กรุณากรอกรหัสนิสิต");
      return;
    }

    // 1. หา player
    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("*")
      .eq("student_id", studentId)
      .maybeSingle();

    if (playerError || !player) {
      setError("ไม่พบรหัสนิสิตนี้");
      return;
    }

    // 2. หา result ล่าสุด (สำคัญมาก)
    const { data: result, error: resultError } = await supabase
      .from("results")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (resultError) {
      setError("เกิดข้อผิดพลาดในการดึงผลสอบ");
      return;
    }

    // 3. ยังไม่เคยทำ → ไป quiz
    if (!result) {
      sessionStorage.setItem(
        "userData",
        JSON.stringify({
          name: player.name,
          student_id: player.student_id,
          phone: player.phone,
        })
      );

      router.push("/quiz");
      return;
    }

    // 4. เคยทำแล้ว “ผ่าน” → ไป result ทันที
    if (result.is_pass === true) {
      sessionStorage.setItem(
        "quizResult",
        JSON.stringify({
          score: result.score,
          total: result.total,
          isPass: true,
        })
      );

      sessionStorage.setItem(
        "userData",
        JSON.stringify({
          name: player.name,
          student_id: player.student_id,
          phone: player.phone,
        })
      );

      router.push("/winners");
      return;
    }

    // 5. เคยทำแล้ว “ไม่ผ่าน” → ให้ทำใหม่
    sessionStorage.setItem(
      "userData",
      JSON.stringify({
        name: player.name,
        student_id: player.student_id,
        phone: player.phone,
      })
    );

    router.push("/quiz");
  };

  return (
    <div className="flex items-center justify-center px-4 min-h-dvh bg-purple-50">
      <div className="w-full max-w-sm bg-white p-8 rounded-[2rem] shadow-sm border border-purple-100">

        <h1 className="mb-6 text-xl font-bold text-center text-purple-700">
          เข้าสู่ระบบ
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">

          <div>
            <label className="block mb-2 ml-2 text-sm text-purple-700">
              รหัสนิสิต
            </label>

            <input
              value={studentId}
              onChange={(e) =>
                setStudentId(e.target.value.replace(/\D/g, "").slice(0, 8))
              }
              placeholder="กรอกรหัสนิสิต 8 หลัก"
              className="w-full px-5 py-3 text-sm text-purple-900 placeholder-purple-300 border border-purple-100 rounded-2xl bg-purple-50 focus:outline-none focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-xl">
              {error}
            </div>
          )}
          <div className="mt-4 text-sm text-center text-purple-600">
            <Link href="/" className="hover:underline">
              ลงทะเบียน
            </Link>
          </div>

          <button
            type="submit"
            className="w-full py-3 font-semibold text-white transition bg-purple-600 rounded-2xl hover:bg-purple-700"
          >
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
}