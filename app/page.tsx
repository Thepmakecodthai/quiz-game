/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/jsx-no-comment-textnodes */
"use client";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // For using the referenced image
import Link from "next/link";

export default function Page() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("กรุณากรอกชื่อ-นามสกุล");
    if (!studentId.trim()) return setError("กรุณากรอกรหัสนิสิต");
    if (!/^\d{8}$/.test(studentId)) return setError("รหัสนิสิตต้องเป็น 8 หลัก");
    if (!/^\d{10}$/.test(phone)) return setError("เบอร์โทรต้อง 10 หลัก");

    const { data: existingPlayer } = await supabase
      .from("players")
      .select("id")
      .eq("student_id", studentId)
      .maybeSingle();

    if (existingPlayer) {
      setError("รหัสนิสิตนี้ลงทะเบียนแล้ว");
      return;
    }

    const { error: insertError } = await supabase
      .from("players")
      .insert([
        {
          student_id: studentId,
          name: name.trim(),
          phone,
        },
      ]);

    if (insertError) {
      console.error(insertError);
      setError(insertError.message);
      return;
    }

    sessionStorage.setItem(
      "userData",
      JSON.stringify({
        name,
        student_id: studentId,
        phone,
      })
    );

    router.push("/quiz");
  };
  // Color mappings based on Screenshot 2569-07-01 at 23.32.51.png
  // Purple from 'ICT': #4C1D95 (deep purple for text), #7C3AED (button), #F5F3FF (very light for bg)
  // Gold-Orange from 'UP': #D97706 (amber-orange for text), #FCD34D (gold-amber for highlights), #FFFBEB (very light for error bg)

  return (
    <div className="flex items-center justify-center px-4 min-h-dvh bg-purple-50">

      {/* Main Card */}
      <div className="w-full max-w-sm bg-white p-8 rounded-[2rem] shadow-sm border border-purple-100">

        {/* Header */}
        <div className="flex flex-col items-center mb-8 text-center">


          <Image
            src="/images/logo.png"
            alt="logo"
            width={120}
            height={120}
            priority
          />
          <p className="text-purple-600 text-sm mt-1.5">กรอกข้อมูลก่อนเริ่มทำแบบทดสอบ</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div>
            <label className="text-[13px] text-purple-700 font-medium ml-2 block mb-1.5">
              ชื่อ-นามสกุล
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น สมหญิง รักเรียน"
              className="w-full px-5 py-3.5 rounded-2xl bg-purple-50 border border-purple-100
             text-purple-900 placeholder-purple-300 text-sm
             focus:outline-none focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-100
             transition-all duration-200"
            />
          </div>

          {/* Student ID */}
          <div>
            <label className="text-[13px] text-purple-700 font-medium ml-2 block mb-1.5">
              รหัสนิสิต
            </label>
            <input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value.replace(/\D/g, "").slice(0, 8))}
              maxLength={8}
              placeholder="รหัสนิสิต 8 หลัก"
              className="w-full px-5 py-3.5 rounded-2xl bg-purple-50 border border-purple-100
                         text-purple-900 placeholder-purple-300 text-sm
                         focus:outline-none focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-100
                         transition-all duration-200"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-[13px] text-purple-700 font-medium ml-2 block mb-1.5">
              เบอร์โทรศัพท์
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08XXXXXXXX"
              maxLength={10}
              className="w-full px-5 py-3.5 rounded-2xl bg-purple-50 border border-purple-100
                         text-purple-900 placeholder-purple-300 text-sm
                         focus:outline-none focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-100
                         transition-all duration-200"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-amber-50 text-amber-700 border border-amber-100 text-[13px] px-4 py-3 rounded-xl flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}
          <div className="mt-4 text-sm text-center text-purple-600">
            <Link href="/resume" className="hover:underline">
              เข้าสู่ระบบ
            </Link>
          </div>

          {/* Button color changed to primary purple and hover state adjusted to primary gold-orange */}
          <button
            type="submit"
            className="w-full mt-4 py-4 rounded-2xl bg-purple-600 text-white
                       font-semibold text-sm hover:bg-amber-600 shadow-sm
                       active:scale-[0.98] transition-all duration-200"
          >
            เริ่มทำแบบทดสอบ
          </button>

        </form>

      </div>
    </div>
  );
}