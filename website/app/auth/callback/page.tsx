import AuthCallback from "../AuthCallback";
import Footer from "../../components/Footer";
import Header from "../../components/Header";

export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50/80 to-slate-100/50 dark:from-slate-900/80 dark:to-slate-950/50">
      <Header />
      <main className="flex flex-1 items-center px-6 py-24">
        <AuthCallback />
      </main>
      <Footer />
    </div>
  );
}
