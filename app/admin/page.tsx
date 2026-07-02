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
  }[];
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
      setCurrentName(
        players[i % players.length].players?.[0]?.name || ""
      );;
      i++;
    }, 40);

    setTimeout(() => {
      clearInterval(interval);

      const winnerRaw =
        players[Math.floor(Math.random() * players.length)];

      setCurrentName(
        winnerRaw.players?.[0]?.name || ""
      );

      const player = winnerRaw.players?.[0];

      if (!player) return;

      setSelected({
        id: player.id,
        name: player.name,
        student_id: player.student_id,
        phone: player.phone,
        score: winnerRaw.score,
      });

      setRolling(false);
    }, 1800);
  };

  // LOGIN PAGE
  if (!auth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-sm p-6 space-y-3 bg-white rounded-xl">
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
            className="w-full py-2 text-white bg-black rounded"
          >
            login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 md:p-10">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Passed students system</p>
        </div>

        <button onClick={logout} className="text-sm underline">
          logout
        </button>
      </div>

      {/* RANDOM */}
      <div className="p-6 mb-6 bg-white rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">Random selector</p>

          <button
            onClick={startRoll}
            disabled={rolling}
            className="text-sm bg-black text-white px-4 py-1.5 rounded disabled:opacity-40"
          >
            {rolling ? "..." : "start"}
          </button>
        </div>

        <div className="py-8 text-center">
          <p className="text-3xl font-semibold">
            {currentName || "—"}
          </p>
        </div>
      </div>

      {/* LIST */}
      <div className="p-4 bg-white rounded-xl">
        <p className="mb-3 text-sm text-gray-500">Passed students</p>

        {loading ? (
          <p className="text-sm text-gray-400">loading...</p>
        ) : (
          <div className="divide-y">
            {players.map((r, i) => {
              const player = r.players?.[0];

              if (!player) return null;

              return (
                <button
                  key={i}
                  onClick={() =>
                    setSelected({
                      id: player.id,
                      name: player.name,
                      student_id: player.student_id,
                      phone: player.phone,
                      score: r.score,
                    })
                  }
                  className="flex justify-between w-full py-3 text-left"
                >
                  <span>{player.name}</span>
                  <span className="text-xs text-gray-400">{r.score}</span>
                </button>
              );
            })}
          </div>
        )}
        {/* MODAL */}
        {selected && (
          <div
            className="fixed inset-0 flex items-center justify-center p-4 bg-black/30"
            onClick={() => setSelected(null)}
          >
            <div
              className="w-full max-w-sm p-6 bg-white rounded-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="mb-4 text-lg font-semibold">
                {selected.name}
              </p>

              <div className="space-y-1 text-sm text-gray-600">
                <p>ID: {selected.student_id}</p>
                <p>Phone: {selected.phone}</p>
                <p>Score: {selected.score}</p>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="w-full py-2 mt-6 text-white bg-black rounded"
              >
                close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}