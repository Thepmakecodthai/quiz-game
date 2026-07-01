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
    <>
    <h1>test</h1>
    </>
  )
}