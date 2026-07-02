"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ResultRow = {
  score: number;
  total: number;
  is_pass: boolean;
  created_at: string;
  players: {
    id: number;
    name: string;
    student_id: string;
    phone: string;
  };
};

type SelectedPlayer = {
  id: number;
  name: string;
  student_id: string;
  phone: string;
  score: number;
};

const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";
const AUTH_KEY = "admin_auth_v1";

export default function AdminPage() {
  const [auth, setAuth] = useState(false);

  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  const [players, setPlayers] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [rolling, setRolling] = useState(false);
  const [currentName, setCurrentName] = useState("");

  const [selected, setSelected] = useState<SelectedPlayer | null>(null);

  // restore auth
  useEffect(() => {
    const saved = sessionStorage.getItem(AUTH_KEY);
    if (saved === "true") setAuth(true);
  }, []);

  // fetch passed users
  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from("results")
        .select(`
          score,
          total,
          is_pass,
          created_at,
          players (
            id,
            name,
            student_id,
            phone
          )
        `)
        .eq("is_pass", true)
        .order("score", { ascending: false });

      if (error) {
        console.error(error);
      }

      if (data) setPlayers(data);
      setLoading(false);
    };

    fetch();
  }, []);

  const login = () => {
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      setAuth(true);
      sessionStorage.setItem(AUTH_KEY, "true");
    } else {
      alert("invalid login");
    }
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setAuth(false);
  };

  const startRoll = () => {
    if (!players.length) return;

    setRolling(true);

    let i = 0;

    const interval = setInterval(() => {
      setCurrentName(players[i % players.length].players.name);
      i++;
    }, 40);

    setTimeout(() => {
      clearInterval(interval);

      const winnerRaw =
        players[Math.floor(Math.random() * players.length)];

      setCurrentName(winnerRaw.players.name);

      setSelected({
        id: winnerRaw.players.id,
        name: winnerRaw.players.name,
        student_id: winnerRaw.players.student_id,
        phone: winnerRaw.players.phone,
        score: winnerRaw.score,
      });

      setRolling(false);
    }, 1800);
  };

  // LOGIN PAGE
  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-sm bg-white rounded-xl p-6 space-y-3">
          <input
            className="w-full p-2 bg-gray-100 rounded"
            placeholder="username"
            onChange={(e) => setUser(e.target.value)}
          />

          <input
            className="w-full p-2 bg-gray-100 rounded"
            type="password"
            placeholder="password"
            onChange={(e) => setPass(e.target.value)}
          />

          <button
            onClick={login}
            className="w-full bg-black text-white py-2 rounded"
          >
            login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Passed students system</p>
        </div>

        <button onClick={logout} className="text-sm underline">
          logout
        </button>
      </div>

      {/* RANDOM */}
      <div className="bg-white rounded-xl p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">Random selector</p>

          <button
            onClick={startRoll}
            disabled={rolling}
            className="text-sm bg-black text-white px-4 py-1.5 rounded disabled:opacity-40"
          >
            {rolling ? "..." : "start"}
          </button>
        </div>

        <div className="text-center py-8">
          <p className="text-3xl font-semibold">
            {currentName || "—"}
          </p>
        </div>
      </div>

      {/* LIST */}
      <div className="bg-white rounded-xl p-4">
        <p className="text-sm text-gray-500 mb-3">Passed students</p>

        {loading ? (
          <p className="text-sm text-gray-400">loading...</p>
        ) : (
          <div className="divide-y">
            {players.map((r, i) => (
              <button
                key={i}
                onClick={() =>
                  setSelected({
                    id: r.players.id,
                    name: r.players.name,
                    student_id: r.players.student_id,
                    phone: r.players.phone,
                    score: r.score,
                  })
                }
                className="w-full flex justify-between py-3 text-left"
              >
                <span>{r.players.name}</span>
                <span className="text-xs text-gray-400">{r.score}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-lg font-semibold mb-4">
              {selected.name}
            </p>

            <div className="text-sm text-gray-600 space-y-1">
              <p>ID: {selected.student_id}</p>
              <p>Phone: {selected.phone}</p>
              <p>Score: {selected.score}</p>
            </div>

            <button
              onClick={() => setSelected(null)}
              className="w-full mt-6 bg-black text-white py-2 rounded"
            >
              close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}