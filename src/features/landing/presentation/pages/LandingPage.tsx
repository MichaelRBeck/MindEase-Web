import Link from "next/link";

export function LandingPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-[#F4F4F9] to-[#E1F5FE] flex flex-col items-center justify-center px-6 py-12">
            <div className="max-w-4xl mx-auto text-center space-y-8">
                <section data-testid="landing-hero" className="space-y-6" aria-labelledby="landing-title">
                    <h1
                        id="landing-title"
                        className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2C3E50] tracking-tight leading-tight"
                    >
                        Welcome to MindEase
                    </h1>

                    <p className="text-lg md:text-xl leading-relaxed text-[#546E7A] max-w-2xl mx-auto">
                        A calm digital space designed for neurodivergent minds. Organize your thoughts without overwhelming your senses.
                    </p>
                </section>

                <nav aria-label="Primary actions" className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link data-testid="get-started-btn" href="/onboarding" className="btn-primary">
                        Get Started
                    </Link>

                    <Link data-testid="login-btn" href="/auth" className="btn-secondary">
                        Sign In
                    </Link>
                </nav>

                <section data-testid="features-preview" className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16" aria-label="Feature preview">
                    <article className="card space-y-3">
                        <div className="w-12 h-12 bg-[#E1F5FE] rounded-2xl flex items-center justify-center" aria-hidden="true">
                            <span className="text-2xl">🧘</span>
                        </div>
                        <h2 className="text-xl font-bold text-[#2C3E50]">Calm Interface</h2>
                        <p className="text-sm text-[#546E7A] leading-relaxed">
                            Soft colors, gentle transitions, and predictable layouts reduce sensory overload.
                        </p>
                    </article>

                    <article className="card space-y-3">
                        <div className="w-12 h-12 bg-[#E8F5E9] rounded-2xl flex items-center justify-center" aria-hidden="true">
                            <span className="text-2xl">✨</span>
                        </div>
                        <h2 className="text-xl font-bold text-[#2C3E50]">Customizable</h2>
                        <p className="text-sm text-[#546E7A] leading-relaxed">
                            Adjust font size, spacing, and complexity to match your cognitive needs.
                        </p>
                    </article>

                    <article className="card space-y-3">
                        <div className="w-12 h-12 bg-[#FFF8E1] rounded-2xl flex items-center justify-center" aria-hidden="true">
                            <span className="text-2xl">🎯</span>
                        </div>
                        <h2 className="text-xl font-bold text-[#2C3E50]">Focus Support</h2>
                        <p className="text-sm text-[#546E7A] leading-relaxed">
                            Gentle timers, task management, and focus modes help you stay on track.
                        </p>
                    </article>
                </section>
            </div>
        </main>
    );
}
