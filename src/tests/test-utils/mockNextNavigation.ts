jest.mock('next/navigation', () => {
    const actual = jest.requireActual('next/navigation')
    return {
        ...actual,
        useRouter: () => ({
            push: jest.fn(),
            replace: jest.fn(),
            back: jest.fn(),
            prefetch: jest.fn(),
        }),
        usePathname: () => '/tasks',
        useSearchParams: () => new URLSearchParams(),
    }
})
