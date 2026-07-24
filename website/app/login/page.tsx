import Footer from "../components/Footer";
import Header from "../components/Header";
import AuthStart from "../auth/AuthStart";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50/80 to-slate-100/50 dark:from-slate-900/80 dark:to-slate-950/50">
      <Header currentPage="login" />
      <main className="flex flex-1 items-center px-6 py-24">
        <section className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-6xl">
            Sign in to CodeFlow
          </h1>
          <p className="mb-10 text-xl text-slate-600 dark:text-slate-400">
            Continue through Mystira Identity to access the CodeFlow alpha.
          </p>
          <AuthStart intent="login" />
        </section>
      </main>
      <Footer />
    </div>
  );
}
