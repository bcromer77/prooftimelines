"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const [email, setEmail] = useState("");

  return (
    <main style={{ maxWidth: 420, margin: "80px auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
        ProofTimeline
      </h1>

      <p style={{ marginBottom: 12, opacity: 0.8 }}>
        Dev login (email only). We’ll switch to magic links / Google before launch.
      </p>

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        type="email"
        style={{
          width: "100%",
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 8,
          marginBottom: 12,
        }}
      />

      <button
        onClick={() => signIn("credentials", { email, callbackUrl: "/" })}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Sign in
      </button>
    </main>
  );
}

