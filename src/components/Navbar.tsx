import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import logo from "@/assets/shopsonline-logo.svg";

const NAV_LINKS = [
  { label: "Bills Payment", href: "https://www.onshops.online/" },
  { label: "Shops Online", href: "https://www.onshops.online/" },
  { label: "Create Online Store", href: "https://www.onshops.online/create" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="border-b border-border bg-background relative z-40">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">

          {/* Logo */}
          <Link to="/" onClick={() => setMenuOpen(false)}>
            <img src={logo} alt="ShopsOnline" className="h-12" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors ${link.label === "Bills Payment"
                  ? "border-b-2 border-primary pb-1 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="outline" size="sm" className="rounded-lg" asChild>
              <Link to="/login">Create Account</Link>
            </Button>
            <Button size="sm" className="rounded-lg" asChild>
              <Link to="/login">Login</Link>
            </Button>
          </div>

          {/* Mobile: Login + Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <Button size="sm" className="rounded-lg" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

        </div>
      </header>

      {/* ── Mobile slide-in drawer ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />

            {/* Drawer panel — slides from the right */}
            <motion.aside
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              className="fixed right-0 top-0 z-50 flex h-full w-[80vw] max-w-xs flex-col bg-background shadow-2xl"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <Link to="/" onClick={() => setMenuOpen(false)}>
                  <img src={logo} alt="ShopsOnline" className="h-9" />
                </Link>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex flex-col gap-1 px-4 py-6 flex-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.07 + i * 0.07 }}
                    onClick={() => setMenuOpen(false)}
                    className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${link.label === "Bills Payment"
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground hover:bg-muted"
                      }`}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </nav>

              {/* CTAs at the bottom */}
              <div className="border-t border-border px-5 py-6 space-y-3">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28 }}
                >
                  <Button variant="outline" className="w-full rounded-xl" asChild>
                    <Link to="/login" onClick={() => setMenuOpen(false)}>
                      Create Account
                    </Link>
                  </Button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.34 }}
                >
                  <Button className="w-full rounded-xl" asChild>
                    <Link to="/login" onClick={() => setMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
