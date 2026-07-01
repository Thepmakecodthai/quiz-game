"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Question = {
  id: number;
  question: string;
  choice_a: string;
  choice_b: string;
  choice_c: string | null;
  choice_d: string | null;
  correct_answer: string;
};

export default function QuizPage() {
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user =
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("userData") || "{}")
      : {};

  // 📦 LOAD QUESTIONS
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .limit(5);

      console.log("📦 QUESTIONS DATA:", data);
      console.log("❌ ERROR:", error);

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setError("ไม่มีคำถามในฐานข้อมูล");
        setLoading(false);
        return;
      }

      // shuffle เอง (แทน .order("random()"))
      const shuffled = data.sort(() => Math.random() - 0.5);

      setQuestions(shuffled);
      setLoading(false);
    };

    fetchQuestions();
  }, []);

  // ⏳ LOADING
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <p className="text-purple-500">กำลังโหลดคำถาม...</p>
      </div>
    );
  }

  // ❌ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <div className="text-center">
          <p className="text-red-500 font-semibold">เกิดข้อผิดพลาด</p>
          <p className="text-sm text-purple-500 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  // ❌ NO DATA
  if (!questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <p className="text-purple-500">ไม่มีคำถาม</p>
      </div>
    );
  }

  const q = questions[index];

  if (!q) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <p className="text-purple-500">จบแบบทดสอบแล้ว</p>
      </div>
    );
  }

  // 👉 NEXT
  const handleNext = () => {
    const current = questions[index];

    let newScore = score;

    if (selected === current.correct_answer) {
      newScore = score + 1;
      setScore(newScore);
    }

    setSelected("");

    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      finishQuiz(newScore);
    }
  };

  // 👉 FINISH
  const finishQuiz = async (finalScore: number) => {
    const total = questions.length;
    const isPass = finalScore >= total / 2;

    await supabase.from("results").insert([
      {
        student_id: Number(user.studentId),
        score: finalScore,
        total,
        is_pass: isPass,
      },
    ]);

    await supabase
      .from("players")
      .update({ score: finalScore })
      .eq("student_id", user.studentId);

    sessionStorage.setItem(
      "quizResult",
      JSON.stringify({
        score: finalScore,
        total,
        isPass,
      })
    );

    router.push("/result");
  };

  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* HEADER */}
        <div className="text-center mb-6">
          <div className="text-3xl font-black text-purple-700">
            ICT Quiz
          </div>
          <p className="text-sm text-purple-500">
            ข้อ {index + 1} / {questions.length}
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-purple-100">

          {/* QUESTION */}
          <h2 className="text-purple-900 font-semibold mb-5 text-lg">
            {q.question}
          </h2>

          {/* CHOICES */}
          <div className="space-y-3">
            {["A", "B", "C", "D"].map((key) => {
              const text =
                key === "A"
                  ? q.choice_a
                  : key === "B"
                  ? q.choice_b
                  : key === "C"
                  ? q.choice_c
                  : q.choice_d;

              if (!text) return null;

              return (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  className={`w-full text-left px-4 py-3 rounded-2xl border transition-all duration-200
                    ${
                      selected === key
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-purple-50 text-purple-900 border-purple-100 hover:border-amber-300"
                    }`}
                >
                  {text}
                </button>
              );
            })}
          </div>

          {/* NEXT */}
          <button
            onClick={handleNext}
            disabled={!selected}
            className="w-full mt-6 py-3 rounded-2xl bg-purple-600 text-white font-semibold
                       hover:bg-amber-600 disabled:opacity-40 transition-all"
          >
            {index + 1 === questions.length ? "ส่งคำตอบ" : "ข้อถัดไป"}
          </button>

        </div>
      </div>
    </div>
  );
}