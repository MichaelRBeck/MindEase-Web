import Link from "next/link";

export function LandingPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-[#F4F4F9] to-[#E1F5FE] flex flex-col items-center justify-center px-6 py-12">
            <div className="max-w-4xl mx-auto text-center space-y-8">
                {/* Hero com mensagem principal */}
                <section data-testid="landing-hero" className="space-y-6" aria-labelledby="landing-title">
                    <h1
                        id="landing-title"
                        className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2C3E50] tracking-tight leading-tight"
                    >
                        Bem-vindo ao MindEase
                    </h1>

                    <p className="text-lg md:text-xl leading-relaxed text-[#546E7A] max-w-2xl mx-auto">
                        Um espaço digital calmo, pensado para mentes neurodivergentes. Organize suas ideias sem sobrecarregar seus
                        sentidos.
                    </p>
                </section>

                {/* Botões principais da home */}
                <nav aria-label="Ações principais" className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link data-testid="get-started-btn" href="/onboarding" className="btn-primary">
                        Começar
                    </Link>

                    <Link data-testid="login-btn" href="/auth" className="btn-secondary">
                        Entrar
                    </Link>
                </nav>

                {/* Resumo rápido das funcionalidades */}
                <section
                    data-testid="features-preview"
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
                    aria-label="Prévia de recursos"
                >
                    <article className="card space-y-3">
                        <div
                            className="w-12 h-12 bg-[#E1F5FE] rounded-2xl flex items-center justify-center"
                            aria-hidden="true"
                        >
                            <span className="text-2xl">🧘</span>
                        </div>
                        <h2 className="text-xl font-bold text-[#2C3E50]">Interface calma</h2>
                        <p className="text-sm text-[#546E7A] leading-relaxed">
                            Cores suaves, transições gentis e layout previsível para reduzir sobrecarga sensorial.
                        </p>
                    </article>

                    <article className="card space-y-3">
                        <div
                            className="w-12 h-12 bg-[#E8F5E9] rounded-2xl flex items-center justify-center"
                            aria-hidden="true"
                        >
                            <span className="text-2xl">✨</span>
                        </div>
                        <h2 className="text-xl font-bold text-[#2C3E50]">Personalizável</h2>
                        <p className="text-sm text-[#546E7A] leading-relaxed">
                            Ajuste fonte, espaçamento e complexidade para combinar com suas necessidades.
                        </p>
                    </article>

                    <article className="card space-y-3">
                        <div
                            className="w-12 h-12 bg-[#FFF8E1] rounded-2xl flex items-center justify-center"
                            aria-hidden="true"
                        >
                            <span className="text-2xl">🎯</span>
                        </div>
                        <h2 className="text-xl font-bold text-[#2C3E50]">Apoio ao foco</h2>
                        <p className="text-sm text-[#546E7A] leading-relaxed">
                            Timers gentis, organização de tarefas e modos de foco para te manter no caminho.
                        </p>
                    </article>
                </section>
            </div>
        </main>
    );
}
