import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { clearSession, loadSession, saveSession } from "../lib/session";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, loading, enabled } = useAuth();
  const session = loadSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      const displayName = session?.playerName ?? (user.user_metadata?.display_name as string) ?? "";
      setName(displayName);
    }
  }, [user]);

  const handleAuth = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) {
      setError("Supabase belum dikonfigurasi.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal autentikasi.");
    } finally {
      setBusy(false);
    }
  };

  const handleSaveName = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Nama minimal 2 karakter.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      if (supabase && user) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { display_name: trimmed }
        });
        if (updateError) throw updateError;
      }
      saveSession({ playerName: trimmed, userId: user?.id, email: user?.email ?? email });
      navigate("/lobby");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan nama.");
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    clearSession();
  };

  if (!enabled) {
    return (
      <div className="min-h-screen px-6 py-12 text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-3xl">Supabase belum diatur</h1>
          <p className="mt-3 text-white/70">
            Isi <code>VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_ANON_KEY</code> pada
            <code>.env</code> untuk mengaktifkan login email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <span className="chip text-white/70">Monopoly Royale</span>
            <h1 className="font-display text-4xl text-white md:text-5xl">Bangun kerajaan properti bersama teman.</h1>
          </div>
          <div className="panel-dark w-full max-w-xs p-5">
            <p className="text-sm text-white/70">
              Login email untuk masuk lobby. Setelah login, pilih nama panggilan di meja.
            </p>
          </div>
        </header>

        <section className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <div className="panel p-8">
            <h2 className="font-display text-2xl text-ink">Login Email</h2>
            <p className="mt-2 text-sm text-ink/70">Gunakan email dan password untuk masuk.</p>

            {loading ? (
              <p className="mt-6 text-sm text-ink/60">Memuat sesi...</p>
            ) : user ? (
              <form className="mt-6 flex flex-col gap-4" onSubmit={handleSaveName}>
                <div>
                  <p className="text-sm text-ink/60">Login sebagai {user.email}</p>
                </div>
                <input
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-ink placeholder:text-ink/40 focus:border-accent focus:outline-none"
                  placeholder="Nama pemain"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={24}
                />
                <button className="btn-primary" type="submit" disabled={busy}>
                  Lanjut ke Lobby
                </button>
                <button className="btn-ghost" type="button" onClick={handleSignOut}>
                  Keluar
                </button>
              </form>
            ) : (
              <form className="mt-6 flex flex-col gap-4" onSubmit={handleAuth}>
                <input
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-ink placeholder:text-ink/40 focus:border-accent focus:outline-none"
                  placeholder="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                />
                <input
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-ink placeholder:text-ink/40 focus:border-accent focus:outline-none"
                  placeholder="Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                />
                <div className="flex gap-2">
                  <button className="btn-primary flex-1" type="submit" disabled={busy}>
                    {mode === "signin" ? "Masuk" : "Daftar"}
                  </button>
                  <button
                    className="btn-ghost"
                    type="button"
                    onClick={() => setMode((prev) => (prev === "signin" ? "signup" : "signin"))}
                  >
                    {mode === "signin" ? "Buat Akun" : "Punya Akun"}
                  </button>
                </div>
              </form>
            )}

            {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
          </div>

          <div className="flex flex-col gap-4">
            <div className="panel-dark p-6">
              <h3 className="font-display text-xl text-white">Mode Real-time</h3>
              <ul className="mt-4 space-y-2 text-sm text-white/70">
                <li>2-6 pemain per room</li>
                <li>Aturan dadu ganda dan jail lengkap</li>
                <li>Chat langsung di meja permainan</li>
              </ul>
            </div>
            <div className="panel-dark p-6">
              <h3 className="font-display text-xl text-white">Target Kemenangan</h3>
              <p className="mt-2 text-sm text-white/70">Jadilah pemain terakhir yang tidak bangkrut.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;