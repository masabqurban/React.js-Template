import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { LogOut, Menu, Settings } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mainNav } from "@/config/navigation";
import { initials } from "@/lib/format";

import { Logo } from "./logo";

export type ShellUser = { name: string; email: string; role: string };

type AppShellProps = {
  user: ShellUser;
  onSignOut: () => void;
  children: ReactNode;
};

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <ul className="flex flex-col gap-1">
      {mainNav.map(({ label, to, icon: Icon }) => (
        <li key={to}>
          <Link
            to={to}
            onClick={onNavigate}
            // `/` must not stay active on every page.
            activeOptions={{ exact: to === "/" }}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:bg-primary-soft aria-[current=page]:text-link"
          >
            <Icon aria-hidden className="size-4" />
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Signed-in layout: sidebar on desktop, drawer on mobile, top bar with theme
 * and user menus. It receives the user and sign-out as props, so this shared
 * component never depends on the auth feature.
 */
export function AppShell({ user, onSignOut, children }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-svh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col gap-6 border-e border-border bg-card p-4 lg:flex">
        <Logo />
        <nav aria-label="Main">
          <NavLinks />
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
          <DialogPrimitive.Root open={menuOpen} onOpenChange={setMenuOpen}>
            <DialogPrimitive.Trigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open menu"
              >
                <Menu aria-hidden />
              </Button>
            </DialogPrimitive.Trigger>
            <DialogPrimitive.Portal>
              <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/50 lg:hidden" />
              <DialogPrimitive.Content
                aria-describedby={undefined}
                className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col gap-6 border-e border-border bg-card p-4 shadow-xl lg:hidden"
              >
                <DialogPrimitive.Title className="sr-only">
                  Menu
                </DialogPrimitive.Title>
                <Logo />
                <nav aria-label="Mobile">
                  <NavLinks onNavigate={() => setMenuOpen(false)} />
                </nav>
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          </DialogPrimitive.Root>

          <div className="lg:hidden">
            <Logo />
          </div>

          <div className="ms-auto flex items-center gap-1">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <span
                    aria-hidden
                    className="inline-flex size-8 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-link"
                  >
                    {initials(user.name)}
                  </span>
                  <span className="hidden text-sm font-medium sm:inline">
                    {user.name}
                  </span>
                  <span className="sr-only">account menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <span className="block font-semibold">{user.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings aria-hidden />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onSignOut}>
                  <LogOut aria-hidden />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main
          id="main"
          className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
