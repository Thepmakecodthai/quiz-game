"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Game() {
  const [questions, setQuestions] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("questions")
        .select("*")
        .limit(5)

      setQuestions(data)
    }

    fetchData()
  }, [])

  return (
    <div>
      <h1>Quiz Game 🎮</h1>

      {questions.map((q, i) => (
        <div key={i}>
          <h3>{q.question}</h3>
          <p>A: {q.a}</p>
          <p>B: {q.b}</p>
          <p>C: {q.c}</p>
          <p>D: {q.d}</p>
        </div>
      ))}
    </div>
  )
}