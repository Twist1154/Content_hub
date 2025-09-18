import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("h-6 w-6", className)}
  >
    <path d="M12 22a10 10 0 0 0 10-10H2a10 10 0 0 0 10 10Z" />
    <path d="m16 8-4-4-4 4" />
    <path d="M12 4v9" />
  </svg>
);
