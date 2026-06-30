import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Transcription", path: "/transcription" },
    { label: "Scheduling", path: "/scheduling" },
    { label: "Data Extraction", path: "/data-extraction" },
    { label: "Admin Automation", path: "/admin" },
    { label: "Compliance", path: "/compliance" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="font-bold text-xl text-primary">
          MedNova AI
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 hover:bg-muted rounded">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
};
