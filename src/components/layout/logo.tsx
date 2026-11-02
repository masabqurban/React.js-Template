import { env } from "@/config/env";

export function Logo() {
  return (
    <span className="flex items-center gap-2.5 font-bold tracking-tight">
      <svg viewBox="0 0 32 32" aria-hidden className="size-8 text-primary">
        <rect width="32" height="32" rx="8" fill="currentColor" />
        <path
          d="M10 22 16 9l6 13M12.5 17h7"
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {env.VITE_APP_NAME}
    </span>
  );
}
