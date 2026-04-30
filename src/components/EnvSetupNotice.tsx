export default function EnvSetupNotice() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "linear-gradient(to bottom right, #eff6ff, #faf5ff, #fdf2f8)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 560,
          background: "white",
          borderRadius: 16,
          padding: 32,
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22, color: "#111827" }}>
          Supabase env not configured
        </h1>
        <p style={{ marginTop: 12, color: "#4b5563", fontSize: 14, lineHeight: 1.6 }}>
          The app needs <code>VITE_SUPABASE_URL</code> and{" "}
          <code>VITE_SUPABASE_ANON_KEY</code>. Create a file named{" "}
          <code>.env.local</code> in the repo root with:
        </p>
        <pre
          style={{
            background: "#f3f4f6",
            padding: 12,
            borderRadius: 8,
            fontSize: 12,
            overflowX: "auto",
            color: "#111827",
          }}
        >{`VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY`}</pre>
        <p style={{ marginTop: 12, color: "#4b5563", fontSize: 14, lineHeight: 1.6 }}>
          You can find both in your Supabase dashboard at{" "}
          <strong>Project Settings → API</strong>. After creating the file,
          restart <code>npm run dev</code>.
        </p>
      </div>
    </div>
  );
}
