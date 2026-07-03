import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const start = Date.now();

  const { count, error } = await supabase
    .from("questions")
    .select("*", {
      count: "exact",
      head: true,
    });

  if (error) {
    console.error(error);

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
    count,
    ms: Date.now() - start,
  });
}