"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/presentation/AuthProvider";

type Mode = "login" | "signup";

function friendlyFirebaseError(err: unknown) {
    const msg = (err as any)?.message as string | undefined;
    const code = (err as any)?.code as string | undefined;

    // Mensagens curtas (acessibilidade cognitiva)
    switch (code) {
        case "auth/invalid-email":
            return "Email inválido.";
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
            return "Email ou senha incorretos.";
        case "auth/email-already-in-use":
            return "Esse email já está em uso.";
        case "auth/weak-password":
            return "Senha fraca. Use pelo menos 6 caracteres.";
        case "auth/network-request-failed":
            return "Falha de rede. Tente novamente.";
        default:
            return msg ?? "Não foi possível autenticar. Tente novamente.";
    }
}

export function AuthPage() {
    const router = useRouter();
    const { signIn, signUp } = useAuth();
    const { status, signOut } = useAuth();

    const [mode, setMode] = React.useState<Mode>("login");
    const isLogin = mode === "login";

    const [email, setEmail] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");
    const [confirmPassword, setConfirmPassword] = React.useState<string>("");
    const [name, setName] = React.useState<string>("");

    const [loading, setLoading] = React.useState<boolean>(false);
    const [showPassword, setShowPassword] = React.useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState<boolean>(false);
    const [formError, setFormError] = React.useState<string | null>(null);


    function toggleMode() {
        setFormError(null);
        setLoading(false);
        setMode((m) => (m === "login" ? "signup" : "login"));
        setName("");
        setConfirmPassword("");
        setShowConfirmPassword(false);
    }

    function validate(): string | null {
        if (!email.trim()) return "Please enter your email.";
        if (!password) return "Please enter your password.";

        if (!isLogin) {
            if (!name.trim()) return "Please enter your name.";
            if (!confirmPassword) return "Please confirm your password.";
            if (password !== confirmPassword) return "Passwords do not match.";
            if (password.length < 6) return "Password must be at least 6 characters.";
        }

        return null;
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setFormError(null);

        const error = validate();
        if (error) {
            setFormError(error);
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                await signIn(email, password);
            } else {
                await signUp(email, password);
            }

            router.replace("/dashboard");
        } catch (err: any) {
            setFormError(err?.message ?? "Falha ao autenticar");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main
            data-testid="auth-container"
            className="min-h-screen bg-[#F4F4F9] flex flex-col items-center justify-center px-6 py-12"
        >
            <div className="max-w-md w-full mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-[#2C3E50] mb-2">
                        {isLogin ? "Welcome Back" : "Join MindEase"}
                    </h1>
                    <p className="text-base text-[#546E7A]">
                        {isLogin ? "Sign in to continue your journey" : "Create your calm space"}
                    </p>
                </header>

                <section className="card">
                    <form data-testid="auth-form" onSubmit={handleSubmit} className="space-y-6" noValidate>
                        {!isLogin && (
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-[#2C3E50] mb-2">
                                    Name
                                </label>
                                <input
                                    data-testid="auth-name-input"
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    className="input-field"
                                    autoComplete="name"
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[#2C3E50] mb-2">
                                Email
                            </label>
                            <input
                                data-testid="auth-email-input"
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="input-field"
                                autoComplete="email"
                                inputMode="email"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[#2C3E50] mb-2">
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    data-testid="auth-password-input"
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-field pr-24"
                                    autoComplete={isLogin ? "current-password" : "new-password"}
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[#005A9C] hover:text-[#004C8C] transition-colors"
                                    aria-pressed={showPassword}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        {!isLogin && (
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#2C3E50] mb-2">
                                    Confirm Password
                                </label>

                                <div className="relative">
                                    <input
                                        data-testid="auth-confirm-password-input"
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="input-field pr-24"
                                        autoComplete="new-password"
                                        required
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[#005A9C] hover:text-[#004C8C] transition-colors"
                                        aria-pressed={showConfirmPassword}
                                        aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
                                    >
                                        {showConfirmPassword ? "Hide" : "Show"}
                                    </button>
                                </div>

                                {/* feedback simples (visual, sem “toque especial” pesado) */}
                                {confirmPassword.length > 0 && (
                                    <p
                                        className={`mt-2 text-sm ${password === confirmPassword ? "text-[#2E7D32]" : "text-[#C62828]"
                                            }`}
                                        aria-live="polite"
                                    >
                                        {password === confirmPassword ? "Passwords match." : "Passwords do not match."}
                                    </p>
                                )}
                            </div>
                        )}

                        {formError && (
                            <div
                                role="alert"
                                className="bg-[#FFEBEE] border border-[#C62828]/30 rounded-2xl p-4 text-sm text-[#2C3E50]"
                            >
                                {formError}
                            </div>
                        )}

                        <button
                            data-testid="auth-submit-btn"
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            data-testid="auth-toggle-btn"
                            type="button"
                            onClick={toggleMode}
                            className="text-[#005A9C] hover:text-[#004C8C] font-medium transition-colors"
                        >
                            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                        </button>
                    </div>
                </section>
            </div>
        </main>
    );
}
