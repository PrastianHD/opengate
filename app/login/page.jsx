import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginButton from "./LoginButton";

export const metadata = {
  title: "Sign in | OpenGates",
};

export default async function LoginPage({ searchParams }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Already signed in — bounce to dashboard (or `next` param)
  const params = await searchParams;
  const next = params?.next || "/dashboard";
  if (user) redirect(next);

  return (
    <section className="auth-section">
      <div className="auth-card">
        <div className="auth-brand">
          <img src="/logo.svg" alt="OpenGates" />
          <span>OpenGates</span>
        </div>

        <h1>Welcome back</h1>
        <p className="auth-sub">
          Sign in with Google to access your dashboard, manage API keys, and top
          up credit.
        </p>

        <LoginButton next={next} />

        <div className="auth-fineprint">
          By signing in, you agree to our terms of service and privacy policy.
        </div>
      </div>
    </section>
  );
}
