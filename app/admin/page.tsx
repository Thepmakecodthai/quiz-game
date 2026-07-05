"use client";
import PassedTab from "./PassedTab";
import RandomTab from "./RandomTab";
import AnnouncementTab from "./AnnouncementTab";
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

  const [checkingAuth, setCheckingAuth] = useState(true);



  const [selected, setSelected] = useState<SelectedPlayer | null>(null);

  const [tab, setTab] = useState<
    "passed" | "random" | "announce"
  >("passed");

  // restore auth
  useEffect(() => {
    const saved = sessionStorage.getItem(AUTH_KEY);

    if (saved === "true") {
      setAuth(true);
    }

    setCheckingAuth(false);
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

      if (data) {
        const formatted = data.map((item: any) => ({
          ...item,
          players: Array.isArray(item.players)
            ? item.players[0]
            : item.players,
        }));

        console.log(JSON.stringify(formatted[0], null, 2));

        setPlayers(formatted);
      }

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

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        loading...
      </div>
    );
  }



  // LOGIN PAGE
  if (!auth) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-gray-50">
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
    <div className="p-6 min-h-dvh bg-gray-50 md:p-10">

      {/* HEADER */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold">ICT ADMIN</h1>
          <p className="text-sm text-gray-500">Information and Communication Technology</p>
        </div>

        <button
          onClick={logout}
          className="flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <path
              fill="#C70000"
              d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h7v2H5v14h7v2zm11-4l-1.375-1.45l2.55-2.55H9v-2h8.175l-2.55-2.55L16 7l5 5z"
            />
          </svg>
        </button>
      </div>


      <div className="flex gap-4 mb-6 text-sm">
        <button
          onClick={() => setTab("passed")}
          className={tab === "passed" ? "font-semibold" : ""}
        >
          ผู้ผ่าน
        </button>

        <button
          onClick={() => setTab("random")}
          className={tab === "random" ? "font-semibold" : ""}
        >
          สุ่ม
        </button>

        <button
          onClick={() => setTab("announce")}
          className={tab === "announce" ? "font-semibold" : ""}
        >
          ประกาศผล
        </button>
      </div>
      {tab === "passed" && (
        <PassedTab
          players={players}
          loading={loading}
          onSelect={setSelected}
        />
      )}

      {tab === "random" && (
        <RandomTab
          players={players}
          onPublished={() => setTab("announce")}
        />
      )}

      {tab === "announce" && (
        <AnnouncementTab />
      )}
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
  );
}