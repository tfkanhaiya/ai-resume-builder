import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Resume from "./pages/Resume";
import { Loader2 } from "lucide-react";

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [page, setPage] = useState("login"); // "login" | "signup"

  useEffect(() => {
    // ✅ Get current session on load (stay logged in)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    // ✅ Listen for login/logout changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Show spinner while checking session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  // ✅ If logged in → show Resume app
  if (session) {
    return <Resume session={session} />;
  }

  // ✅ If not logged in → show Login or Signup
  return page === "login" ? (
    <Login onSwitch={() => setPage("signup")} />
  ) : (
    <Signup onSwitch={() => setPage("login")} />
  );
}