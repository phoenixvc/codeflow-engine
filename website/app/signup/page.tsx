import AuthStart from "../auth/AuthStart";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50/80 to-slate-100/50 dark:from-slate-900/80 dark:to-slate-950/50">
      <Header currentPage="signup" />
      <main className="flex flex-1 items-center px-6 py-24">
        <section className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-6xl">
            Create your CodeFlow account
          </h1>
          <p className="mb-10 text-xl text-slate-600 dark:text-slate-400">
            Mystira Identity will create or connect your account before returning you to CodeFlow.
          </p>
          <AuthStart intent="signup" />
        </section>
      </main>
      <Footer />
    </div>
  );
}
