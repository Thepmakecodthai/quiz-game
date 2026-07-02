import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const imageDir = path.join(process.cwd(), "public/quiz-images");

function shuffle<T>(arr: T[]) {
  return arr.sort(() => Math.random() - 0.5);
}

function getName(file: string) {
  return path.parse(file).name.replace(/[-_]/g, " ").trim();
}

function pickABCDAfterShuffle(
  choices: string[],
  correct: string
) {
  const map = ["A", "B", "C", "D"] as const;

  const labeled = choices.map((c, i) => ({
    label: map[i],
    value: c,
  }));

  const correctLabel =
    labeled.find((x) => x.value === correct)?.label ?? "A";

  return { labeled, correctLabel };
}

async function seed() {
  const files = fs.readdirSync(imageDir);

  const names = files.map(getName);

  const questions = files.map((file) => {
    const correct = getName(file);

    const others = names.filter((n) => n !== correct);
    const wrong = shuffle(others).slice(0, 3);

    const shuffled = shuffle([correct, ...wrong]);

    const { labeled, correctLabel } = pickABCDAfterShuffle(
      shuffled,
      correct
    );

    return {
      question: "จากรูปคือโปรแกรมอะไร?",
      image_url: `/quiz-images/${file}`,
      choice_a: labeled[0].value,
      choice_b: labeled[1].value,
      choice_c: labeled[2].value,
      choice_d: labeled[3].value,
      correct_answer: correctLabel, // ✅ A/B/C/D
    };
  });

  const { error } = await supabase.from("questions").insert(questions);

  if (error) {
    console.error("❌ seed failed:", error);
  } else {
    console.log(`✅ seed success: ${questions.length} questions`);
  }
}

seed();