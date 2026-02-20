"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/presentation/AuthProvider";

type Mode = "login" | "signup";

// Conversor de erros do Firebase para texto mais amigável
function friendlyFirebaseError(err: unknown) {
    const msg = (err as any)?.message as string | undefined;
    const code = (err as any)?.code as string | undefined;

    switch (code) {
        case "auth/invalid-email":
            return "E-mail inválido.";
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
            return "E-mail ou senha incorretos.";
        case "auth/email-already-in-use":
            return "Este e-mail já está em uso.";
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
    // Vem do AuthProvider, funções pra login e cadastro
    const { signIn, signUp } = useAuth();
    const { status, signOut } = useAuth();

    // Define se a tela está em login ou cadastro
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

    // Alterna entre login e cadastro e limpa os campos extras
    function toggleMode() {
        setFormError(null);
        setLoading(false);
        setMode((m) => (m === "login" ? "signup" : "login"));
        setName("");
        setConfirmPassword("");
        setShowConfirmPassword(false);
    }

    // Validação simples antes de chamar o Firebase
    function validate(): string | null {
        if (!email.trim()) return "Digite seu e-mail.";
        if (!password) return "Digite sua senha.";

        if (!isLogin) {
            if (!name.trim()) return "Digite seu nome.";
            if (!confirmPassword) return "Confirme sua senha.";
            if (password !== confirmPassword) return "As senhas não conferem.";
            if (password.length < 6) return "A senha deve ter pelo menos 6 caracteres.";
        }

        return null;
    }

    // Faz login/cadastro e redireciona pro dashboard
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
        } catch (err: unknown) {
            setFormError(friendlyFirebaseError(err));
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
                        {isLogin ? "Bem-vindo(a) de volta" : "Entrar no MindEase"}
                    </h1>
                    <p className="text-base text-[#546E7A]">
                        {isLogin ? "Faça login para continuar" : "Crie seu espaço com mais calma e foco"}
                    </p>
                </header>

                <section className="card">
                    <form data-testid="auth-form" onSubmit={handleSubmit} className="space-y-6" noValidate>
                        {!isLogin && (
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-[#2C3E50] mb-2">
                                    Nome
                                </label>
                                <input
                                    data-testid="auth-name-input"
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Seu nome"
                                    className="input-field"
                                    autoComplete="name"
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[#2C3E50] mb-2">
                                E-mail
                            </label>
                            <input
                                data-testid="auth-email-input"
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                className="input-field"
                                autoComplete="email"
                                inputMode="email"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[#2C3E50] mb-2">
                                Senha
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
                                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                >
                                    {showPassword ? "Ocultar" : "Mostrar"}
                                </button>
                            </div>
                        </div>

                        {!isLogin && (
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#2C3E50] mb-2">
                                    Confirmar senha
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
                                        aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
                                    >
                                        {showConfirmPassword ? "Ocultar" : "Mostrar"}
                                    </button>
                                </div>

                                {/* Feedback rápido de conferência de senha */}
                                {confirmPassword.length > 0 && (
                                    <p
                                        className={`mt-2 text-sm ${password === confirmPassword ? "text-[#2E7D32]" : "text-[#C62828]"
                                            }`}
                                        aria-live="polite"
                                    >
                                        {password === confirmPassword ? "As senhas conferem." : "As senhas não conferem."}
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
                            {loading ? "Aguarde..." : isLogin ? "Entrar" : "Criar conta"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            data-testid="auth-toggle-btn"
                            type="button"
                            onClick={toggleMode}
                            className="text-[#005A9C] hover:text-[#004C8C] font-medium transition-colors"
                        >
                            {isLogin ? "Não tem conta? Criar agora" : "Já tem conta? Entrar"}
                        </button>
                    </div>
                </section>
            </div>
        </main>
    );
}
