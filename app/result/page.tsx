"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ResultPage() {
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const result = sessionStorage.getItem("quizResult");

    if (result) {
      setData(JSON.parse(result));
    }

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <p className="text-purple-500">กำลังโหลดผลสอบ...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <p className="text-purple-500">ไม่มีข้อมูลผลสอบ</p>
      </div>
    );
  }

  const { score, total, isPass } = data;

  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-sm border border-purple-100 p-8 text-center">

        {/* ICON */}
        <div className="text-5xl mb-4">
          {isPass ? "🎉" : "😢"}
        </div>

        {/* TITLE */}
        <h1 className="text-2xl font-bold text-purple-700">
          {isPass ? "สอบผ่านแล้ว!" : "สอบไม่ผ่าน"}
        </h1>

        <p className="text-purple-500 text-sm mt-2">
          ผลคะแนนของคุณ
        </p>

        {/* SCORE */}
        <div className="mt-6 bg-purple-50 rounded-2xl py-6">
          <p className="text-4xl font-bold text-purple-700">
            {score} / {total}
          </p>

          <p className="text-sm text-purple-500 mt-2">
            {isPass ? "ยินดีด้วย 🎓" : "ลองใหม่อีกครั้ง"}
          </p>
        </div>

        {/* BUTTON */}
        <button
          onClick={() => router.push("/")}
          className="w-full mt-6 py-3 rounded-2xl bg-purple-600 text-white font-semibold
                     hover:bg-amber-500 transition-all"
        >
          กลับหน้าแรก
        </button>

      </div>
    </div>
  );
}