"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
type Question = {
  id: number;
  question: string;
  image_url?: string | null;
  choice_a: string;
  choice_b: string;
  choice_c: string | null;
  choice_d: string | null;
  correct_answer: string;
};

const STORAGE_KEY = "quiz_progress_v1";
const QUESTIONS_KEY = "quiz_questions_v1";
const PROGRESS_KEY = "quiz_progress_v1";

export default function QuizPage() {
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [ready, setReady] = useState(false);



  useEffect(() => {
    const checkPassed = async () => {
      const userData = sessionStorage.getItem("userData");

      if (!userData) {
        router.replace("/");
        return;
      }

      const { student_id } = JSON.parse(userData);

      if (!student_id) {
        router.replace("/");
        return;
      }

      const { data } = await supabase
        .from("results")
        .select("is_pass")
        .eq("student_id", student_id)
        .eq("is_pass", true)
        .maybeSingle();

      if (data?.is_pass) {
        router.replace("/result"); // หรือ /already-done
      }
    };

    checkPassed();
  }, []);


  const user =
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("userData") || "{}")
      : {};



  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const fetchQuestions = async () => {
      setLoading(true);

      const saved = sessionStorage.getItem(QUESTIONS_KEY);

      // 🔥 IMPORTANT: validate saved ก่อนใช้
      let finalQuestions: Question[] | null = null;

      if (saved) {
        try {
          const parsed = JSON.parse(saved);

          // กันของพัง / array ว่าง
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log("🟢 LOAD FROM STORAGE");
            finalQuestions = parsed;
          }
        } catch (e) {
          console.log("❌ STORAGE CORRUPT → RESET");
          sessionStorage.removeItem(QUESTIONS_KEY);
        }
      }

      // 🔥 ถ้าไม่มีของเก่า → ค่อยสุ่มใหม่
      if (!finalQuestions) {
        const { data } = await supabase
          .from("questions")
          .select("*");

        const shuffled = [...(data || [])]
          .sort(() => Math.random() - 0.5)
          .slice(0, 5);

        finalQuestions = shuffled;

        sessionStorage.setItem(
          QUESTIONS_KEY,
          JSON.stringify(shuffled)
        );

        console.log("🟡 NEW SHUFFLE");
      }

      setQuestions(finalQuestions);

      const savedProgress =
        sessionStorage.getItem(PROGRESS_KEY);

      if (savedProgress) {
        const progress = JSON.parse(savedProgress);

        console.log("🟢 RESTORE PROGRESS", progress);

        setIndex(progress.index || 0);
        setScore(progress.score || 0);
      } else {
        setIndex(0);
        setScore(0);
      }

      setSelected("");
      setLoading(false);
    };

    fetchQuestions();
  }, []);

  // 💾 save progress
  const saveProgress = (nextIndex: number, nextScore: number) => {
    sessionStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify({
        index: nextIndex,
        score: nextScore,
      })
    );
  };

  // 🏁 FINISH QUIZ
  const finishQuiz = async (finalScore: number) => {
    const total = questions.length;
    const isPass = finalScore >= total / 2;

    // 🔥 STOP animation ทันที
    setAnimating(false);

    sessionStorage.removeItem(PROGRESS_KEY);
    sessionStorage.removeItem(QUESTIONS_KEY);
    sessionStorage.removeItem(STORAGE_KEY);

    const user = JSON.parse(sessionStorage.getItem("userData") || "{}");
    const studentId = user?.student_id;

    if (!studentId) return;

    await supabase.from("results").insert([
      {
        student_id: studentId,
        score: finalScore,
        total,
        is_pass: isPass,
      },
    ]);

    sessionStorage.setItem(
      "quizResult",
      JSON.stringify({ score: finalScore, total, isPass })
    );

    // ❌ ลบ delay ทิ้งเลย
    router.push("/result");
  };

  // ➡️ NEXT
  const handleNext = () => {
    const current = questions[index];
    if (!current) return;

    let newScore = score;

    if (selected === current.correct_answer) {
      newScore++;
    }

    const isLast = index === questions.length - 1;

    setSelected("");

    // 🔥 ถ้าเป็นข้อสุดท้าย → ห้าม animation
    if (isLast) {
      finishQuiz(newScore);
      return;
    }

    // 🟢 ยังไม่ใช่ข้อสุดท้าย ค่อย animation ได้
    setAnimating(true);

    setTimeout(() => {
      const nextIndex = index + 1;

      setIndex(nextIndex);
      setScore(newScore);
      saveProgress(nextIndex, newScore);

      setAnimating(false);
    }, 200);
  };
  // 🧼 LOADING
  if (loading || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-purple-50">
        <p className="text-purple-500">กำลังโหลดข้อสอบ...</p>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-purple-50">
        <p className="text-purple-500">ไม่มีคำถาม</p>
      </div>
    );
  }

  const q = questions[index];

  if (!q) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-purple-50">
        <p className="text-purple-500">จบแบบทดสอบแล้ว</p>
      </div>
    );
  }


  return (
    <div className="flex items-center justify-center px-4 min-h-dvh bg-purple-50">
      <div className="w-full max-w-md">

        {/* HEADER */}
        <div className="mb-4 text-center">
          <div className="text-2xl font-black text-purple-700">
            ICT Quiz
          </div>

          {user?.name && (
            <div className="inline-block px-4 py-1 mt-2 text-sm text-purple-700 bg-purple-100 rounded-full">
              {user.name}
            </div>
          )}
        </div>

        {/* PROGRESS */}
        <div className="mb-4">
          <div className="flex justify-between mb-2 text-xs text-purple-500">
            <span>Progress</span>
            <span>{index + 1} / {questions.length}</span>
          </div>

          <div className="w-full h-2 overflow-hidden bg-purple-100 rounded-full">
            <div
              className="h-full transition-all duration-300 bg-purple-600"
              style={{
                width: `${((index + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* CARD */}
        <div
          className={`bg-white rounded-[2rem] p-5 border border-purple-100 shadow-sm transition-all duration-300
          ${animating ? "opacity-0 translate-x-10" : "opacity-100 translate-x-0"}`}
        >


          <h2 className="mb-5 text-lg font-semibold text-purple-900">
            {q.question}
          </h2>

          {q.image_url && (
            <div className="relative w-full mb-4 overflow-hidden bg-white border border-gray-300 h-36 rounded-xl">
              <Image
                src={q.image_url}
                alt="question"
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-contain"
              />
            </div>
          )}


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
                  className={`w-full text-left px-4 py-3 rounded-2xl border transition-all
                    ${selected === key
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-purple-50 text-purple-900 border-purple-100"
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
            className="w-full py-3 mt-6 font-semibold text-white bg-purple-600 rounded-2xl disabled:opacity-40 hover:bg-purple-700"
          >
            {index + 1 === questions.length ? "ส่งคำตอบ" : "ข้อถัดไป"}
          </button>
        </div>
      </div>
    </div>
  );
}