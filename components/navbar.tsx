"use client";

import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { getTranslations } from "../managers/languageManager";
import { Translations } from "../translations.d";

import { siteConfig } from "@/config/site";
import { useAuth } from "@/app/auth-context";

const logo = "./logo.jpg";

// Icons
const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12h18M3 6h18M3 18h18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

// Landing page navigation items
const landingNavItems = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
];

export const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated: isAuthenticatedClient, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isLandingPage, setIsLandingPage] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("");
  const [userRole, setUserRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState("");
  const [translations, setTranslations] = useState<Translations | null>(null);
  const pageLoadedRef = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, profilePic } = useAuth();

  useEffect(() => {
    const detectLanguage = async () => {
      const browserLanguage = navigator.language.slice(0, 2);
      setLanguage(browserLanguage);
      const all_translations = await getTranslations(browserLanguage);
      setTranslations(all_translations);
    };

    detectLanguage();
    pageLoadedRef.current = true;
  }, []);

  useEffect(() => {
    if (!user) {
      setName("");
      setEmail("");
      setUserRole("");
      return;
    }
    setEmail(user.email);
    setUserRole(user.role);
    setName(`${user.first_name || ""} ${user.last_name || ""}`.trim());
  }, [user]);

  useEffect(() => {
    setIsLandingPage(pathname === "/");

    switch (pathname) {
      case "/":
        setShowMenu(false);
        break;
      case "/chat":
        setCurrentPage("chat");
        setShowMenu(true);
        break;
      case "/games":
        setCurrentPage("games");
        setShowMenu(true);
        break;
      case "/agents":
        setCurrentPage("agents");
        setShowMenu(true);
        break;
      case "/profile":
        setCurrentPage("profile");
        setShowMenu(true);
        break;
      default:
        setShowMenu(false);
        break;
    }

    if (!isAuthenticatedClient) {
      setShowMenu(false);
    }
  }, [isAuthenticatedClient, pathname]);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const signoutUser = () => {
    logout();
    router.push("/");
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const isExternalLink = (value: string) => value === "feedback" || value === "help" || value === "support";

  const filteredNavItems = siteConfig.navItems.filter((item) => {
    if (!isAuthenticatedClient) return false;
    if (item.language && item.language !== language) return false;
    if (userRole === "user" && !item.allow_user) return false;
    return true;
  });

  const filteredMobileItems = siteConfig.navMenuItems.filter((item) => {
    if (!name) return false;
    if (item.language && item.language !== language) return false;
    if (userRole === "user" && !item.allow_user) return false;
    return true;
  });

  return (
    <nav className="sticky top-0 z-50 w-full">
      {/* Main navbar container */}
      <div className="relative bg-gradient-to-r from-zinc-900/95 via-zinc-900/98 to-zinc-900/95 backdrop-blur-xl border-b border-white/10">
        {/* Subtle purple glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-violet-500/5 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <NextLink href="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <img
                    alt="Low Content AI"
                    src={logo}
                    className="relative h-10 w-10 rounded-xl object-cover ring-2 ring-white/10 group-hover:ring-purple-500/50 transition-all duration-300"
                  />
                </div>
                <span className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">
                  Low Content AI
                </span>
              </NextLink>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {/* Landing Page Navigation */}
              {isLandingPage && (
                <>
                  {landingNavItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => scrollToSection(item.href)}
                      className="relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-white/70 hover:text-white hover:bg-white/5"
                    >
                      {item.label}
                    </button>
                  ))}
                </>
              )}

              {/* App Navigation (when authenticated) */}
              {!isLandingPage && filteredNavItems.map((item, index) => {
                const isActive = currentPage === item.value.toLowerCase();
                const isExternal = isExternalLink(item.value);

                return (
                  <NextLink
                    key={`${item.value}-${index}`}
                    href={item.href}
                    target={isExternal ? "_blank" : undefined}
                    className={`
                      relative px-4 py-2 rounded-xl text-sm font-medium
                      transition-all duration-200
                      flex items-center gap-1.5
                      ${isActive
                        ? "text-purple-400 bg-purple-500/10"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                      }
                    `}
                  >
                    {item.label}
                    {isExternal && <ExternalLinkIcon />}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full" />
                    )}
                  </NextLink>
                );
              })}
            </div>

            {/* User Profile / CTA (Desktop) */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Landing Page CTA */}
              {isLandingPage && !isAuthenticatedClient && (
                <>
                  <button
                    onClick={() => router.push("/home")}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => router.push("/home")}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-lg shadow-purple-500/25 transition-all duration-200 hover:scale-105"
                  >
                    Get Started
                  </button>
                </>
              )}

              {/* Landing Page - Authenticated User */}
              {isLandingPage && isAuthenticatedClient && (
                <button
                  onClick={() => router.push("/chat")}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-lg shadow-purple-500/25 transition-all duration-200 hover:scale-105"
                >
                  Go to App
                </button>
              )}

              {/* App User Profile */}
              {!isLandingPage && name && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-all duration-200"
                  >
                    {/* Avatar */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                      {profilePic ? (
                        <img
                          src={profilePic}
                          alt={name}
                          className="h-9 w-9 rounded-full object-cover ring-2 ring-purple-500/50"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-medium text-sm">
                          {name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Name and Email */}
                    <div className="text-left hidden xl:block">
                      <p className="text-sm font-medium text-white">{name}</p>
                      <p className="text-xs text-purple-400">{email}</p>
                    </div>

                    <ChevronDownIcon />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 origin-top-right animate-scale-in">
                      <div className="bg-gradient-to-b from-zinc-800/95 to-zinc-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-purple-500/10 overflow-hidden">
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-sm font-medium text-white">{name}</p>
                          <p className="text-xs text-purple-400 truncate">{email}</p>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                          <button
                            onClick={() => {
                              router.push("/profile");
                              setUserDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all duration-200"
                          >
                            <UserIcon />
                            <span className="text-sm">{translations?.my_profile || "My Profile"}</span>
                          </button>

                          <div className="my-2 border-t border-white/10" />

                          <button
                            onClick={signoutUser}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                          >
                            <LogoutIcon />
                            <span className="text-sm">Log Out</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            {(showMenu || isLandingPage) && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white"
              >
                {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (showMenu || isLandingPage) && (
        <div className="lg:hidden fixed inset-0 top-16 z-40">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="absolute top-0 right-0 w-full max-w-sm h-full bg-gradient-to-b from-zinc-900/98 to-zinc-950/98 backdrop-blur-xl border-l border-white/10 overflow-y-auto animate-slide-in-right">
            {/* Landing Page Mobile Menu */}
            {isLandingPage && (
              <>
                <div className="p-6 border-b border-white/10">
                  <p className="text-lg font-semibold text-white">Menu</p>
                </div>

                <div className="p-4 space-y-1">
                  {landingNavItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => scrollToSection(item.href)}
                      className="w-full flex items-center px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200"
                    >
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-zinc-900/50 space-y-2">
                  {!isAuthenticatedClient ? (
                    <>
                      <button
                        onClick={() => {
                          router.push("/home");
                          setMobileMenuOpen(false);
                        }}
                        className="w-full px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => {
                          router.push("/home");
                          setMobileMenuOpen(false);
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold shadow-lg shadow-purple-500/25 transition-all duration-200"
                      >
                        Get Started
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        router.push("/chat");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold shadow-lg shadow-purple-500/25 transition-all duration-200"
                    >
                      Go to App
                    </button>
                  )}
                </div>
              </>
            )}

            {/* App Mobile Menu */}
            {!isLandingPage && (
              <>
                {/* User Info */}
                {name && (
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-4">
                      {profilePic ? (
                        <img
                          src={profilePic}
                          alt={name}
                          className="h-14 w-14 rounded-2xl object-cover ring-2 ring-purple-500/50"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl">
                          {name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-lg font-semibold text-white">{name}</p>
                        <p className="text-sm text-purple-400">{email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Links */}
                <div className="p-4 space-y-1">
                  {filteredMobileItems.map((item, index) => {
                    const isActive = currentPage === item.value.toLowerCase();
                    const isExternal = isExternalLink(item.value);

                    return (
                      <NextLink
                        key={`mobile-${item.value}-${index}`}
                        href={item.href}
                        target={isExternal ? "_blank" : undefined}
                        onClick={() => !isExternal && setMobileMenuOpen(false)}
                        className={`
                          flex items-center justify-between px-4 py-3 rounded-xl
                          transition-all duration-200
                          ${isActive
                            ? "text-purple-400 bg-purple-500/10 border border-purple-500/20"
                            : "text-white/70 hover:text-white hover:bg-white/5"
                          }
                        `}
                      >
                        <span className="font-medium">{item.label}</span>
                        {isExternal && <ExternalLinkIcon />}
                      </NextLink>
                    );
                  })}
                </div>

                {/* Bottom Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-zinc-900/50">
                  <button
                    onClick={() => {
                      router.push("/profile");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all duration-200 mb-2"
                  >
                    <UserIcon />
                    <span className="font-medium">{translations?.my_profile || "My Profile"}</span>
                  </button>

                  <button
                    onClick={signoutUser}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all duration-200"
                  >
                    <LogoutIcon />
                    <span className="font-medium">Log Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
