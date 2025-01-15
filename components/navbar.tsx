"use client";

import { Divider } from "@nextui-org/divider";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { Link } from "@nextui-org/link";
import {
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Navbar as NextUINavbar,
} from "@nextui-org/navbar";
import { Spacer } from "@nextui-org/spacer";
import { User } from "@nextui-org/user";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { getTranslations } from "../managers/languageManager";
import { Translations } from "../translations.d";

import { siteConfig } from "@/config/site";
import { useAuth } from "@/app/auth-context";

const logo = "./logo.jpg";

export const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated: isAuthenticatedClient, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState("");
  const [userRole, setUserRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState("");
  const [translations, setTranslations] = useState<Translations | null>(null);
  const pageLoadedRef = useRef(false);
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

  const signoutUser = () => {
    logout();
    router.push("/");
  };

  return (
    <NextUINavbar maxWidth="2xl" position="sticky">
      <NavbarContent className="basis-1/5 md:basis-full gap-2" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            {/*<Logo />*/}
            <img alt="logo" height="50" src={logo} width="50" />
            <p className="font-bold text-inherit" style={{ fontSize: "25px" }}>
              Low Content AI
            </p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => {
            return (
              isAuthenticatedClient &&
              ((userRole == "user" && item.allow_user) || userRole != "user"
                ? (!item.language || item.language == language) && (
                  <NavbarItem key={item.href}>
                    <NextLink
                      style={{
                        color:
                          currentPage === item.value.toLowerCase()
                            ? "#9353D3"
                            : "white",
                      }}
                      href={item.href}
                      // Correct condition for internal and external links
                      target={
                        item.value === "feedback" || item.value === "help"
                          ? "_blank"
                          : undefined
                      }
                    >
                      {item.label}
                    </NextLink>
                  </NavbarItem>
                )
                : null)
            );
          })}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden lg:flex max-w-fit"
        justify="end"
      >
        <NavbarItem className="hidden lg:flex">
          {name && (
            <Dropdown placement="bottom-start">
              <DropdownTrigger>
                <User
                  as="button"
                  avatarProps={{
                    isBordered: true,
                    src: profilePic ?? "",
                  }}
                  className="transition-transform"
                  description={
                    <span style={{ color: "#9353D3" }}>{email}</span>
                  }
                  name={name}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="User Actions" variant="flat">
                <DropdownItem
                  key="profile"
                  onClick={() => router.push("/profile")}
                >
                  {translations?.my_profile}
                </DropdownItem>
                <DropdownItem key="logout" color="danger" onClick={signoutUser}>
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="lg:hidden basis-1 pl-4" justify="end">
        {showMenu && <NavbarMenuToggle />}
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {showMenu &&
            siteConfig.navMenuItems
              .filter(
                (item) =>
                  (userRole === "user" && item.allow_user) ||
                  userRole !== "user"
              )
              .filter((item) => !item.language || item.language === language)
              .map(
                (item, index) =>
                  name && (
                    <NavbarMenuItem key={`${item}-${index}`}>
                      <NextLink
                        href={item.href}
                        style={{
                          color:
                            currentPage === item.value.toLowerCase()
                              ? "#9353D3"
                              : "white",
                        }}
                        target={
                          item.value === "feedback" || item.value === "help"
                            ? "_blank"
                            : undefined
                        }
                      >
                        {item.label}
                      </NextLink>
                    </NavbarMenuItem>
                  )
              )}
          <Spacer y={4} />
          <Divider />
          <NavbarMenuItem key="profile">
            <NextLink color="foreground" href="/profile">
              {translations?.my_profile}
            </NextLink>
          </NavbarMenuItem>
          <NavbarMenuItem key="logout">
            <Link color="danger" href="#" size="lg" onClick={logout}>
              Logout
            </Link>
          </NavbarMenuItem>
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
};
