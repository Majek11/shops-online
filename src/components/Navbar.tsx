import { Button } from "@/components/ui/button";
import logo from "@/assets/shopsonline-logo.svg";

const Navbar = () => {
  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <img src={logo} alt="ShopsOnline" className="h-8" />
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#" className="border-b-2 border-primary pb-1 text-sm font-semibold text-primary">
            Bills Payment
          </a>
          <a href="https://www.onshops.online/" className="text-sm text-muted-foreground hover:text-foreground">
            Shops Online
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
            Create Online Store
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="rounded-lg">
            Create Account
          </Button>
          <Button size="sm" className="rounded-lg">
            Login
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
