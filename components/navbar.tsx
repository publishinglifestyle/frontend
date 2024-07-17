"use client";

import React, { useState, useEffect } from 'react';
import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@nextui-org/navbar";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/dropdown";
import { User } from "@nextui-org/user";
import { Spacer } from "@nextui-org/spacer";
import { Divider } from "@nextui-org/divider";
import { Link } from "@nextui-org/link";
import NextLink from "next/link";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/icons";
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/auth-context';
import { getUser, getProfilePic } from '@/managers/userManager';
import { getTranslations } from '../managers/languageManager';
import { Translations } from '../translations.d';

const defaultPic = "./profile.png";

export const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated: isAuthenticatedClient, logout } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState(defaultPic);
  const [language, setLanguage] = useState('');
  const [translations, setTranslations] = useState<Translations | null>(null);

  useEffect(() => {
    const detectLanguage = async () => {
      let browserLanguage = navigator.language;
      browserLanguage = browserLanguage.slice(0, 2);
      setLanguage(browserLanguage);
      const all_translations = await getTranslations(browserLanguage);
      setTranslations(all_translations);
    };

    detectLanguage();
  }, []);

  useEffect(() => {
    console.log("isAuthenticatedClient:", isAuthenticatedClient);
    console.log("pathname:", pathname);

    switch (pathname) {
      case '/': setShowMenu(false); break;
      case '/chat': setCurrentPage('chat'); setShowMenu(true); break;
      case '/agents': setCurrentPage('agents'); setShowMenu(true); break;
      case '/profile': setCurrentPage('profile'); setShowMenu(true); break;
      default: setShowMenu(false); break;
    }

    const fetchData = async () => {
      const result = await getUser();
      setName(`${result.first_name || ''} ${result.last_name || ''}`.trim());
      setEmail(result.email);
      setUserRole(result.role);
      try {
        const logo_img = await getProfilePic();
        setProfileImage(logo_img || defaultPic);
      } catch {
        setProfileImage(defaultPic);
      }
    };

    if (isAuthenticatedClient) {
      setIsAuthenticated(true);
      fetchData();
    }
  }, [isAuthenticatedClient, pathname]);

  const logOut = async () => {
    logout();
    // window.location.href = '/';
  }

  return (
    <NextUINavbar maxWidth="2xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit" style={{ fontSize: "25px" }}>Low Content AI</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => {
            console.log("item.language:", item.language);
            console.log("language:", language);
            return isAuthenticated && (
              (userRole == 'user' && item.allow_user) || userRole != 'user' ? (
                (!item.language || item.language == language) &&
                <NavbarItem key={item.href}>
                  <NextLink
                    style={{
                      color: currentPage === item.value.toLowerCase() ? '#9353D3' : 'white'
                    }}
                    href={item.href}
                  >
                    {item.label}
                  </NextLink>
                </NavbarItem>
              ) : null
            )
          })}
        </ul>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full" justify="end">
        <NavbarItem className="hidden md:flex">
          {name && (
            <Dropdown placement="bottom-start">
              <DropdownTrigger>
                <User
                  as="button"
                  avatarProps={{
                    isBordered: true,
                    src: profileImage,
                  }}
                  className="transition-transform"
                  description={<span style={{ color: "#9353D3" }}>{email}</span>}
                  name={name}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="User Actions" variant="flat">
                <DropdownItem key="profile" onClick={() => router.push('/profile')}>
                  {translations?.my_profile}
                </DropdownItem>
                <DropdownItem key="logout" color="danger" onClick={logOut}>
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {showMenu && siteConfig.navMenuItems
            .filter(item => (userRole === 'user' && item.allow_user) || userRole !== 'user')
            .filter(item => !item.language || item.language === language)
            .map((item, index) => (
              name && (
                <NavbarMenuItem key={`${item}-${index}`}>
                  <Link
                    style={{
                      color: currentPage === item.value.toLowerCase() ? '#9353D3' : 'initial'
                    }}
                    href={item.href}
                    size="lg"
                  >
                    {item.label}
                  </Link>
                </NavbarMenuItem>
              )
            ))}
          <Spacer y={4} />
          <Divider />
          <NavbarMenuItem key="profile">
            <Link
              href="/profile"
              color='foreground'
              onClick={() => setIsMenuOpen(false)}
              size="lg"
            >
              {translations?.my_profile}
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem key="logout">
            <Link
              href="#"
              size="lg"
              color="danger"
              onClick={() => {
                logOut();
                setIsMenuOpen(false);
              }}
            >
              Logout
            </Link>
          </NavbarMenuItem>
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
};
