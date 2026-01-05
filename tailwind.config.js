/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "hsl(var(--color-text-primary) / <alpha-value>)",
                secondary: "hsl(var(--bg-secondary) / <alpha-value>)",
                accent: "hsl(var(--color-accent) / <alpha-value>)",
                border: "hsl(var(--color-border) / <alpha-value>)",
                muted: "hsl(var(--color-text-secondary) / <alpha-value>)",
            },
            fontFamily: {
                display: ["var(--font-display-family)", "sans-serif"],
                body: ["var(--font-body-family)", "sans-serif"],
            }
        },
    },
    plugins: [],
}
