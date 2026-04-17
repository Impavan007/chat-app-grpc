import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok) {
      alert("Account created successfully! Please login.");
      router.push("/");
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Create Account</h2>
        <div className="input-group">
          <input 
            placeholder="Username" 
            value={username}
            onChange={e => setUsername(e.target.value)} 
          />
        </div>
        <div className="input-group">
          <input 
            placeholder="Password" 
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)} 
          />
        </div>
        <div className="input-group">
          <input 
            placeholder="Confirm Password" 
            type="password" 
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)} 
          />
        </div>
        <button onClick={handleSignup}>
          Sign Up
        </button>
        
        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem" }}>
          <span style={{ color: "var(--text-muted)" }}>Already have an account? </span>
          <Link href="/" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: "600" }}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
