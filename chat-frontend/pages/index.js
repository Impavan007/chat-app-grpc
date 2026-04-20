import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const login = async () => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("user", username);
      router.push("/chat");
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Welcome Back</h2>
        <div className="input-group">
          <input
            placeholder="Username"
            onChange={e => setUsername(e.target.value)}
          />
        </div>
        <div className="input-group">
          <input
            placeholder="Password"
            type="password"
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button onClick={login}>
          Continue to Chat
        </button>

        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem" }}>
          <span style={{ color: "var(--text-muted)" }}>Don't have an account? </span>
          <Link href="/signup" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: "600" }}>
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
