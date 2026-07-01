"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Home() {
  const [questions, setQuestions] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .limit(5)

      if (error) {
        console.log(error)
      } else {
        setQuestions(data)
      }
    }

    fetchData()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>Quiz Game 🎮</h1>

      {questions.length === 0 && <p>Loading questions...</p>}

      {questions.map((q, i) => (
        <div key={i} style={{ marginTop: 20 }}>
          <h3>{q.question}</h3>

          <ul>
            <li>A: {q.a}</li>
            <li>B: {q.b}</li>
            <li>C: {q.c}</li>
            <li>D: {q.d}</li>
          </ul>
        </div>
      ))}
    </div>
  )
}