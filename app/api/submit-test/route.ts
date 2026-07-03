import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { student_id, score, total, is_pass } = body;

    const { error } = await supabase
      .from("results")
      .insert([
        {
          student_id,
          score,
          total,
          is_pass,
        },
      ]);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: "invalid request",
      },
      { status: 400 }
    );
  }
}