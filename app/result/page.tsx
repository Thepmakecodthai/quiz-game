"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ResultPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [name, setName] = useState("");

  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const result = sessionStorage.getItem("quizResult");
    const user = sessionStorage.getItem("userData");

    if (result) setData(JSON.parse(result));
    if (user) setName(JSON.parse(user).name || "");
  }, []);

  const { score = 0, total = 0, isPass } = data || {};

  useEffect(() => {
    if (!data) return;

    const duration = 700;
    const start = performance.now();

    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (time: number) => {
      const p = Math.min((time - start) / duration, 1);
      setAnimatedScore(ease(p) * score);

      if (p < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [data, score]);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-purple-50">
        <p className="text-purple-500">ไม่มีข้อมูล</p>
      </div>
    );
  }

  const size = 240;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = total ? (animatedScore / total) * circumference : 0;

  const color = isPass ? "#22c55e" : "#ef4444";

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4
      ${isPass ? "bg-green-50" : "bg-red-50"}`}
    >
      <div className="w-full max-w-md text-center">

        {/* NAME */}
        <p className="mb-2 text-sm text-gray-500">
          ผลของ
        </p>

        <h2 className="mb-6 text-lg font-semibold text-gray-800">
          {name || "ไม่ทราบชื่อ"}
        </h2>

        {/* STATUS */}
        <h1
          className={`text-2xl font-bold mb-6 ${isPass ? "text-green-700" : "text-red-600"
            }`}
        >
          {isPass ? "ผ่านแล้ว" : "ยังไม่ผ่าน"}
        </h1>

        {/* CIRCLE */}
        <div className="flex justify-center">
          <div className="relative w-[240px] h-[240px]">

            <svg width={240} height={240} className="rotate-[-90deg]">
              <circle
                cx={120}
                cy={120}
                r={radius}
                stroke="#e5e7eb"
                strokeWidth={stroke}
                fill="none"
              />

              <circle
                cx={120}
                cy={120}
                r={radius}
                stroke={color}
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                strokeLinecap="round"
              />
            </svg>

            {/* SCORE */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-bold text-gray-900">
                {Math.round(animatedScore)}
              </div>
              <div className="text-sm text-gray-500">
                / {total}
              </div>
            </div>

          </div>
        </div>

        {/* BUTTON */}
        <div className="flex justify-center">
          {isPass ? (
            <button
              onClick={() => router.push("/")}
              className="px-8 py-3 mt-8 text-white bg-green-600 rounded-xl"
            >
              กลับหน้าแรก
            </button>
          ) : (
            <button
              onClick={() => router.push("/quiz")}
              className="px-8 py-3 mt-8 text-white bg-red-500 rounded-xl"
            >
              ลองอีกครั้ง
            </button>
          )}
        </div>

      </div>
    </div>
  );
}