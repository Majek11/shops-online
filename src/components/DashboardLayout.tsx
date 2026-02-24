import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { LayoutGrid, Receipt, Wallet, Users, User, LogOut, Bell, X, CheckCircle, AlertCircle, Info, Menu } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import logo from "@/assets/shopsonline-logo.svg";

const navItems = [
  { to: "/dashboard", icon: LayoutGrid, label: "Dashboard", end: true },
  { to: "/dashboard/transactions", icon: Receipt, label: "Transactions History" },
  { to: "/dashboard/bills", icon: Wallet, label: "Bills Payments" },
  { to: "/dashboard/referrals", icon: Users, label: "Refer and Earn" },
];

const settingsItems = [
  { to: "/dashboard/account", icon: User, label: "My Account" },
];

const initialNotifications = [
  { id: 1, type: "success", title: "Airtime Purchase Successful", description: "₦500 MTN airtime purchased successfully.", time: "2 min ago", read: false },
  { id: 2, type: "info", title: "Welcome to ShopsOnline!", description: "Start by funding your wallet to enjoy our services.", time: "1 hour ago", read: false },
  { id: 3, type: "alert", title: "Wallet Funded", description: "Your wallet has been credited with ₦10,000.", time: "3 hours ago", read: false },
  { id: 4, type: "info", title: "New Referral Bonus", description: "You earned ₦50 from a referral purchase.", time: "1 day ago", read: true },
];

const notifIcon = (type: string) => {
  if (type === "success") return <CheckCircle className="h-4 w-4 text-green-500" />;
  if (type === "alert") return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  return <Info className="h-4 w-4 text-primary" />;
};

const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => (
  <nav className="flex-1 px-3 space-y-4">
    {navItems.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`
        }
      >
        <item.icon className="h-5 w-5" />
        {item.label}
      </NavLink>
    ))}

    <div className="pt-4 pb-2">
      <div className="border-t border-border mb-3" />
      <p className="px-4 text-xs font-semibold text-muted-foreground mb-2">Settings</p>
    </div>

    {settingsItems.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`
        }
      >
        <item.icon className="h-5 w-5" />
        {item.label}
      </NavLink>
    ))}

    <button className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground w-full">
      <LogOut className="h-5 w-5" />
      Logout
    </button>
  </nav>
);

const DashboardLayout = () => {
  const location = useLocation();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [mobileOpen, setMobileOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const dismissNotif = (id: number) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[240px] flex-col border-r border-border bg-background fixed top-0 left-0 h-screen z-30">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="ShopsOnline" className="h-10" />
          </div>
        </div>
        <SidebarNav />
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-[240px] min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 md:px-6 py-4 bg-background border-b border-border">
          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden p-1">
                <Menu className="h-6 w-6 text-foreground" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[260px] p-0 pt-6">
              <div className="px-6 pb-4">
                <img src={logo} alt="ShopsOnline" className="h-10" />
              </div>
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 max-w-[calc(100vw-2rem)] p-0">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h4 className="text-sm font-bold text-foreground">Notifications</h4>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 ${
                          !n.read ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className="mt-0.5">{notifIcon(n.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{n.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{n.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                        </div>
                        <button onClick={() => dismissNotif(n.id)} className="text-muted-foreground hover:text-foreground">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-9 w-9 rounded-full bg-primary flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <User className="h-4 w-4 text-primary-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/dashboard/account" className="cursor-pointer gap-2">
                    <User className="h-4 w-4" /> Profile
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
