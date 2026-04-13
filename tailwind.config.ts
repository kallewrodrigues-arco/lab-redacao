import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:      "var(--bg-primary)",
          secondary:    "var(--bg-secondary)",
          hover:        "var(--bg-hover)",
          active:       "var(--bg-active)",
          "active-hover": "var(--bg-active-hover)",
        },
        border: {
          primary:   "var(--border-primary)",
          secondary: "var(--border-secondary)",
          active:    "var(--border-active)",
        },
        text: {
          body:        "var(--text-body)",
          caption:     "var(--text-caption)",
          placeholder: "var(--text-placeholder)",
          "read-only": "var(--text-read-only)",
          "on-color":  "var(--text-on-color)",
          active:      "var(--text-active)",
        },
        icon: {
          primary:   "var(--icon-primary)",
          secondary: "var(--icon-secondary)",
          active:    "var(--icon-active)",
        },
        success: {
          text:   "var(--color-success-text)",
          bg:     "var(--color-success-bg)",
          tag:    "var(--color-success-bg-tag)",
          icon:   "var(--color-success-icon)",
        },
        warning: {
          text:   "var(--color-warning-text)",
          tag:    "var(--color-warning-bg-tag)",
          icon:   "var(--color-warning-icon)",
        },
        danger: {
          text:   "var(--color-danger-text)",
          tag:    "var(--color-danger-bg-tag)",
          icon:   "var(--color-danger-icon)",
        },
        info: {
          text:   "var(--color-info-text)",
          tag:    "var(--color-info-bg-tag)",
          icon:   "var(--color-info-icon)",
        },
        tag: {
          neutral: "var(--tag-bg-neutral)",
          "text-neutral": "var(--tag-text-neutral)",
        },
        chart: {
          1: "var(--chart-color-1)",
          2: "var(--chart-color-2)",
        },
      },
      fontFamily: {
        sans: ["var(--font-family-title)", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs:   ["var(--font-size-xs)",  { lineHeight: "var(--line-height-tight)" }],
        sm:   ["var(--font-size-sm)",  { lineHeight: "var(--line-height-tight)", letterSpacing: "var(--letter-spacing-wide)" }],
        md:   ["var(--font-size-md)",  { lineHeight: "var(--line-height-normal)" }],
        base: ["var(--font-size-base)",{ lineHeight: "var(--line-height-normal)" }],
        lg:   ["var(--font-size-lg)",  { lineHeight: "var(--line-height-tight)" }],
        xl:   ["var(--font-size-xl)",  { lineHeight: "var(--line-height-tight)", letterSpacing: "var(--letter-spacing-tight)" }],
        "2xl":["var(--font-size-2xl)", { lineHeight: "var(--line-height-tight)", letterSpacing: "var(--letter-spacing-tight)" }],
        "3xl":["var(--font-size-3xl)", { lineHeight: "var(--line-height-tight)", letterSpacing: "var(--letter-spacing-tight)" }],
        "4xl":["var(--font-size-4xl)", { lineHeight: "var(--line-height-tight)", letterSpacing: "var(--letter-spacing-tight)" }],
      },
      fontWeight: {
        regular:  "var(--font-weight-regular)",
        medium:   "var(--font-weight-medium)",
        semibold: "var(--font-weight-semibold)",
      },
      letterSpacing: {
        tight:  "var(--letter-spacing-tight)",
        normal: "var(--letter-spacing-normal)",
        wide:   "var(--letter-spacing-wide)",
      },
      borderRadius: {
        none: "var(--radius-none)",
        sm:   "var(--radius-sm)",
        md:   "var(--radius-md)",
        lg:   "var(--radius-lg)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
      },
      height: {
        "tag-sm": "var(--tag-height-sm)",
        "btn-md": "var(--btn-height-md)",
        "input":  "var(--input-height)",
      },
    },
  },
  plugins: [],
};

export default config;
