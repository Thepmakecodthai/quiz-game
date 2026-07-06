"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function ResultPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);


  const [animatedScore, setAnimatedScore] = useState(0);
  useEffect(() => {
    const user = sessionStorage.getItem("userData");
    const result = sessionStorage.getItem("quizResult");

    if (!user || !result) {
      router.replace("/resume");
      return;
    }

    setData(JSON.parse(result));
    setName(JSON.parse(user).name || "");
  }, [router]);
  
  

  useEffect(() => {
    const result = sessionStorage.getItem("quizResult");
    const user = sessionStorage.getItem("userData");

    if (result) setData(JSON.parse(result));

    if (user) {
      const userData = JSON.parse(user);

      setName(userData.name || "");
      setStudentId(userData.student_id || "");
    }
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

  useEffect(() => {
    if (!data || !isPass) return;

    const timer = setTimeout(() => {
      setShowThankYou(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [data, isPass]);


  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-purple-50">
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
      className={`min-h-dvh flex items-center justify-center px-4
      ${isPass ? "bg-green-50" : "bg-red-50"}`}
    >

      <div className="w-full max-w-md text-center">




        <h2 className="text-2xl font-semibold text-gray-800">
          {name || "ไม่ทราบชื่อ"}
        </h2>

        <p className="mb-6 text-lg font-medium text-gray-500">
          {studentId}
        </p>

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
              onClick={() => router.push("/winners")}
              className="px-8 py-3 mt-8 text-white bg-green-600 rounded-xl"
            >
              ไปหน้าประกาศผล
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
      {showThankYou && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-sm p-6 text-center bg-white shadow-xl rounded-3xl">

            <Image
              src="/images/up16.png"
              alt="University of Phayao"
              width={100}
              height={100}
              className="mx-auto mb-4"
              priority
            />

            <h2 className="mb-3 text-xl font-bold text-purple-700">
              ขอบคุณ
            </h2>

            <p className="text-gray-700">
              ขอบคุณที่ร่วมเล่นเกมฉลองครบรอบ 16 ปีมหาวิทยาลัยพะเยา
            </p>

            <button
              onClick={() => setShowThankYou(false)}
              className="w-full py-3 mt-5 text-white bg-purple-600 rounded-2xl"
            >
              ตกลง
            </button>

          </div>
        </div>
      )}
    </div>

  );
}