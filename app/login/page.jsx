import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/api/helpers";
import LoginButton from "./LoginButton";

export const metadata = {
  title: "Sign in | OpenGate",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Already signed in — bounce to dashboard (or `next` param)
  const params = await searchParams;
  const next = safeNextPath(params?.next);
  if (user) redirect(next);

  return (
    <section className="auth-section">
      <div className="auth-card">
        <div className="auth-brand">
          <Image src="/logo.svg" alt="" width={28} height={28} priority />
          <span>OpenGate</span>
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
