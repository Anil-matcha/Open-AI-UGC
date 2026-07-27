"use client";

import Link from "next/link";
import { useSession, signOut, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { IoClose, IoMenu } from "react-icons/io5";
import { FiMoon, FiSun, FiLogOut, FiDollarSign, FiPlus, FiUser, FiKey, FiCheck, FiX, FiTrash2 } from "react-icons/fi";
import { SiVercel } from "react-icons/si";
import config from "@/lib/config";
import toast from "react-hot-toast";

export default function Navbar() {
  const { data: session, status, update: updateSession } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [savingKey, setSavingKey] = useState(false);

  const appName = config?.appName || "AI SaaS";
  const logoLetter = appName.trim().charAt(0).toUpperCase();

  const isApiKeyActive = Boolean(session?.user?.customApiKey);

  useEffect(() => {
    if (session?.user?.customApiKey) {
      setApiKeyInput(session.user.customApiKey);
    }
  }, [session?.user?.customApiKey]);

  const appMatch = pathname ? pathname.match(/^\/app\/([^\/]+)/) : null;
  const currentAppId = appMatch ? appMatch[1] : null;

  const navLinks = currentAppId
    ? [
        { name: "Workspace", path: `/app/${currentAppId}` },
        { name: "Gallery", path: `/app/${currentAppId}/gallery` },
        { name: "Pricing", path: `/app/${currentAppId}/pricing` },
      ]
    : [
        { name: "Workspace", path: "/" },
        { name: "Gallery", path: "/gallery" },
        { name: "Pricing", path: "/pricing" },
      ];

  const handleSaveApiKey = async (e) => {
    e.preventDefault();
    const key = apiKeyInput.trim();
    if (!key) {
      toast.error("Please enter a valid API Key");
      return;
    }
    setSavingKey(true);
    try {
      if (status === "authenticated") {
        const res = await fetch("/api/user/apikey", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apiKey: key }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to save API key");

        await updateSession({ customApiKey: key });
        toast.success("Custom API Key updated!");
        setIsApiKeyModalOpen(false);
        window.location.reload();
      } else {
        const res = await signIn("credentials", {
          apiKey: key,
          redirect: false,
        });
        if (res?.error) {
          throw new Error(res.error || "Failed to sign in with API key");
        }
        toast.success("Signed in with API Key!");
        setIsApiKeyModalOpen(false);
        window.location.reload();
      }
    } catch (err) {
      toast.error(err.message || "Failed to save API Key");
    } finally {
      setSavingKey(false);
    }
  };

  const handleRemoveApiKey = async () => {
    setSavingKey(true);
    try {
      const res = await fetch("/api/user/apikey", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove API key");

      await updateSession({ customApiKey: null });
      setApiKeyInput("");
      toast.success("Custom API Key removed");
      setIsApiKeyModalOpen(false);
      window.location.reload();
    } catch (err) {
      toast.error(err.message || "Failed to remove API Key");
    } finally {
      setSavingKey(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-divider/50 shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        
        {/* Logo and Brand Title */}
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-[1.02] active:scale-95">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-extrabold text-lg shadow-md shadow-primary/30">
            {logoLetter}
          </div>
          <span className="text-lg font-black tracking-tight text-primary-text text-nowrap">
            {appName}
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.name}
                href={link.path}
                className={`text-[13px] font-semibold transition-all relative py-1 ${
                  isActive ? "text-primary" : "text-secondary-text hover:text-primary-text"
                }`}
              >
                {link.name}
                {isActive && (
                  <div className="absolute -bottom-[20px] left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions Section */}
        <div className="hidden md:flex items-center gap-3">
          
          {/* Vercel Deploy Button */}
          <a
            href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSamurAIGPT%2Fcommon-saas-template"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-divider px-4 py-1.5 text-xs font-bold text-secondary-text hover:text-primary-text hover:bg-bg-card transition-colors shadow-sm"
          >
            <SiVercel className="text-xs text-current" />
            <span>Deploy</span>
          </a>

          {/* Add/Manage API Key - Directly visible in Navbar */}
          <button
            onClick={() => setIsApiKeyModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
              isApiKeyActive
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                : "bg-bg-page/50 border-divider text-secondary-text hover:text-white hover:border-primary/40"
            }`}
          >
            <FiKey className={isApiKeyActive ? "text-amber-400" : "text-secondary-text"} />
            <span>{isApiKeyActive ? "Custom API Key" : "Add API Key"}</span>
          </button>

          {status === "authenticated" ? (
            <div className="flex items-center">
              {/* Credit Balance indicator */}
              <div className="flex items-center h-9 border border-divider rounded-l bg-bg-page/30 overflow-hidden pr-2">
                <span className="font-bold text-[13px] px-3 flex items-center text-primary-text gap-1">
                  <FiDollarSign className="text-emerald-500 text-xs" />
                  {isApiKeyActive ? "∞ (API Key)" : session.user.credits !== undefined ? session.user.credits : 0}
                </span>
                {!isApiKeyActive && (
                  <Link
                    href="/pricing"
                    className="flex items-center justify-center w-5 h-5 rounded hover:bg-bg-card text-secondary-text transition-colors"
                  >
                    <FiPlus size={14} />
                  </Link>
                )}
              </div>

              {/* Profile Menu Toggle */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  onBlur={() => setTimeout(() => setIsProfileOpen(false), 200)}
                  className="h-9 w-9 flex items-center justify-center border-y border-r border-divider rounded-r bg-bg-page/30 hover:bg-bg-page transition-colors cursor-pointer"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <FiUser className="text-secondary-text" size={16} />
                  )}
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-11 w-52 rounded border border-divider bg-bg-card p-1 shadow-lg z-[100] animate-scale-up">
                    <div className="px-3 py-2 text-xs text-secondary-text border-b border-divider/50 mb-1 truncate">
                      {session.user.email}
                    </div>
                    <button
                      onClick={() => setIsApiKeyModalOpen(true)}
                      className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-xs font-semibold text-primary-text hover:bg-primary/10 transition-colors"
                    >
                      <FiKey size={14} className="text-amber-400" />
                      <span>{isApiKeyActive ? "Manage API Key" : "Add API Key"}</span>
                    </button>
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <FiLogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-primary text-white px-5 py-1.5 rounded-full text-sm font-bold hover:bg-primary-hover transition-all shadow-md shadow-primary/20"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Navbar Controls */}
        <div className="flex md:hidden items-center gap-2">
          {status === "authenticated" && (
            <div className="flex items-center h-8 border border-divider rounded bg-bg-page/30 px-2.5 text-xs font-bold text-primary-text gap-0.5">
              <FiDollarSign className="text-emerald-500 text-[10px]" />
              {isApiKeyActive ? "∞ Key" : session.user.credits !== undefined ? session.user.credits : 0}
            </div>
          )}
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hover:bg-bg-card p-2 rounded cursor-pointer transition-colors text-primary-text border border-divider/50"
            aria-label="Toggle Menu"
          >
            {isOpen ? <IoClose size={20} /> : <IoMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-[200] glass-dropdown border-b border-divider shadow-2xl py-4 px-6 md:hidden animate-fade-in">
          <nav className="flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold text-secondary-text tracking-widest mb-1">Navigation</span>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center py-2.5 rounded text-sm font-semibold transition-all ${
                  pathname === link.path ? "bg-primary/10 text-primary px-3 border border-primary/20" : "text-primary-text hover:bg-bg-card"
                }`}
              >
                {link.name}
              </Link>
            ))}

            <button
              onClick={() => {
                setIsOpen(false);
                setIsApiKeyModalOpen(true);
              }}
              className="flex w-full items-center justify-between rounded border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs font-bold text-amber-400"
            >
              <div className="flex items-center gap-2">
                <FiKey />
                <span>{isApiKeyActive ? "Manage Custom API Key" : "Add API Key"}</span>
              </div>
            </button>

            <div className="h-px bg-divider/50 my-2" />

            {/* Vercel Deploy in Mobile menu */}
            <a
              href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSamurAIGPT%2Fcommon-saas-template"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-divider py-3 text-xs font-bold text-secondary-text hover:text-primary-text hover:bg-bg-card transition-all"
            >
              <SiVercel className="text-xs text-current" />
              <span>Clone & Deploy Template</span>
            </a>

            {status === "authenticated" ? (
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: "/login" });
                }}
                className="flex w-full items-center justify-center gap-2 rounded bg-red-500/10 text-red-500 py-3 text-sm font-bold hover:bg-red-500/20 transition-all border border-red-500/20 mt-2"
              >
                <FiLogOut size={16} />
                <span>Sign Out</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center rounded bg-primary text-white py-3 text-sm font-bold hover:bg-primary-hover transition-all shadow-md shadow-primary/20 mt-2"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}

      {/* API Key Modal */}
      {isApiKeyModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-bg-card border border-divider w-full max-w-md rounded-xl p-6 space-y-5 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-divider/60 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-black text-sm uppercase">
                <FiKey className="text-base" />
                <span>Custom API Key Settings</span>
              </div>
              <button
                onClick={() => setIsApiKeyModalOpen(false)}
                className="text-secondary-text hover:text-white transition-colors cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <p className="text-xs text-secondary-text leading-relaxed">
              Use your own <strong>MuAPI Key</strong> to generate UGC videos directly without consuming or purchasing website credits.
            </p>

            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase font-bold text-secondary-text tracking-wider">
                  MuAPI Secret Key
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="mu_..."
                  className="w-full bg-bg-page border border-divider rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-secondary-text/50 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                {isApiKeyActive && status === "authenticated" && (
                  <button
                    type="button"
                    onClick={handleRemoveApiKey}
                    disabled={savingKey}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold border border-red-500/20 transition-all cursor-pointer"
                  >
                    <FiTrash2 />
                    <span>Remove Key</span>
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsApiKeyModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-bg-page border border-divider text-xs font-semibold text-secondary-text hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingKey || !apiKeyInput.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-amber-500/20"
                  >
                    <FiCheck />
                    <span>{savingKey ? "Processing..." : status === "authenticated" ? "Save Key" : "Sign In with API Key"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
