"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaGoogle, FaKey, FaInfoCircle, FaArrowRight } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

function LoginContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("callbackUrl") || searchParams.get("next") || "/";

  const [activeTab, setActiveTab] = useState("google"); // "google" | "apikey"
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push(next);
    }
  }, [status, router, next]);

  const handleApiKeyLogin = async (e) => {
    e.preventDefault();
    const key = apiKeyInput.trim();
    if (!key) {
      toast.error("Please enter a valid MuAPI key");
      return;
    }
    if (key.length < 5) {
      toast.error("API Key appears too short");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signIn("credentials", {
        apiKey: key,
        redirect: false,
        callbackUrl: next,
      });

      if (res?.error) {
        toast.error(res.error || "Failed to sign in with API key");
      } else {
        toast.success("Signed in with API Key successfully!");
        router.push(next);
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during API key authentication");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-bg-page px-6 text-primary-text select-none">
      <Toaster position="top-right" />
      <div className="relative bg-bg-card border border-divider w-full max-w-md rounded-xl p-8 space-y-6 shadow-2xl animate-scale-up">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl text-primary font-black shadow-md shadow-primary/15">
            📹
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Sign In to UGC Creator</h2>
          <p className="text-xs font-semibold text-secondary-text leading-relaxed px-2">
            Choose your preferred sign-in method: Google Account or custom MuAPI Key.
          </p>
        </div>

        {/* Auth Method Selector Tabs */}
        <div className="flex bg-bg-page p-1 rounded-lg border border-divider/60">
          <button
            type="button"
            onClick={() => setActiveTab("google")}
            className={`flex-1 py-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "google"
                ? "bg-bg-card text-white shadow-sm border border-divider/40"
                : "text-secondary-text hover:text-white"
            }`}
          >
            <FaGoogle className="text-red-400" />
            <span>Google Account</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("apikey")}
            className={`flex-1 py-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "apikey"
                ? "bg-bg-card text-white shadow-sm border border-divider/40"
                : "text-secondary-text hover:text-white"
            }`}
          >
            <FaKey className="text-amber-400" />
            <span>Use API Key</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "google" ? (
          <div className="space-y-4 pt-2">
            <button
              onClick={() => signIn("google", { callbackUrl: next })}
              className="w-full py-3.5 bg-white text-neutral-900 rounded-full text-xs font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              <FaGoogle className="text-sm text-red-500" />
              <span>Continue with Google</span>
            </button>
            <p className="text-[11px] text-center text-secondary-text">
              Uses system credit balance. Ideal for credit pack purchases.
            </p>
          </div>
        ) : (
          <form onSubmit={handleApiKeyLogin} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase font-bold text-secondary-text tracking-wider">
                MuAPI Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Enter your mu_... key"
                  className="w-full bg-bg-page border border-divider rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-secondary-text/50 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="flex justify-end">
                <a
                  href="https://muapi.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-primary hover:underline font-semibold"
                >
                  Get API Key from MuAPI →
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !apiKeyInput.trim()}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>{isSubmitting ? "Authenticating..." : "Sign In with API Key"}</span>
              <FaArrowRight className="text-xs" />
            </button>

            <p className="text-[11px] text-center text-amber-400/90 font-medium">
              ⚡ Generate UGC videos using your API key. 0 website credits required!
            </p>
          </form>
        )}

        <div className="flex items-start gap-2.5 bg-primary/5 border border-primary/10 p-3.5 rounded text-[11px] leading-relaxed text-secondary-text">
          <FaInfoCircle className="text-primary text-xs shrink-0 mt-0.5" />
          <span>
            By signing in, you agree to our Terms of Service. API keys are kept secure and encrypted for generation calls.
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center bg-bg-page text-primary-text">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
