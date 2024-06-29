"use client"

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
import {
  Logo,
} from "@/components/icons";

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/auth-context';
import { getUser, getProfilePic } from '@/managers/userManager';

const defaultPic = "./profile.png"

export const Navbar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated: isAuthenticatedClient, logout } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState('')
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [userRole, setUserRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(defaultPic);

  useEffect(() => {
    switch (pathname) {
      case '/': {
        setShowMenu(false)
      }
        break;
      case '/chat': {
        setCurrentPage('chat')
        setShowMenu(true)
      }
        break;
      case '/agents': {
        setCurrentPage('agents')
        setShowMenu(true)
      }
        break;
      case '/profile': {
        setCurrentPage('profile')
        setShowMenu(true)
      }
        break;
      default: setShowMenu(false)
        break
    }

    const fetchData = async () => {
      const result = await getUser()

      let full_name = ''
      if (result.first_name) {
        full_name += result.first_name + " "
      }
      if (result.last_name) {
        full_name += result.last_name
      }
      setName(full_name)
      setEmail(result.email)
      setUserRole(result.role)

      try {
        const logo_img = await getProfilePic()
        if (logo_img) {
          setProfileImage(logo_img)
        } else {
          setProfileImage(defaultPic)
        }
      } catch {
        setProfileImage(defaultPic)
      }

    };

    if (isAuthenticatedClient) {
      setIsAuthenticated(true);
      fetchData();
    }

  }, [isAuthenticatedClient, pathname]);

  const logOut = async () => {
    logout()
    //setIsAuthenticated(false)
    //window.location.href = '/'
  }

  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit">Riccardo Mazza</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) =>
            isAuthenticated && (
              (userRole === 'user' && item.allow_user) || userRole !== 'user' ? (
                <NavbarItem key={item.href}>
                  <NextLink
                    style={{
                      color: currentPage === item.label.toLowerCase() ? '#9353D3' : 'initial'
                    }}
                    href={item.href}
                  >
                    {item.label}
                  </NextLink>
                </NavbarItem>
              ) : null
            )
          )}
        </ul>

      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden md:flex">
          {
            name &&
            <>
              <Dropdown placement="bottom-start" style={{ width: "10%" }}>
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
                    My Profile
                  </DropdownItem>
                  <DropdownItem key="logout" color="danger" onClick={logOut}>
                    Log Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </>
          }
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {showMenu &&
            siteConfig.navMenuItems.map((item, index) =>
              ((userRole === 'user' && item.allow_user) || userRole !== 'user') && name ? (
                <NavbarMenuItem key={`${item}-${index}`}>
                  <Link
                    style={{
                      color: currentPage === item.label.toLowerCase() ? '#9353D3' : 'initial'
                    }}
                    href={item.href}
                    size="lg"
                  >
                    {item.label}
                  </Link>
                </NavbarMenuItem>
              ) : null
            )}
          <Spacer y={4} />
          <Divider />
          <NavbarMenuItem key="profile">
            <Link
              href="/profile"
              color='foreground'
              onClick={() => setIsMenuOpen(false)}
              key="profile"
              size="lg"
            >
              My Profile
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem key="logout">
            <Link
              href="#"
              key="logout"
              size="lg"
              color="danger"
              onClick={() => {
                logOut()
                setIsMenuOpen(false)
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
