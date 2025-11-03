'use client';

import { Collection } from '@/lib/neondb/types';
import { ChevronDown, Menu, Phone, ShoppingBag, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface MenuLink {
  title: string;
  path: string;
  hasChildren: boolean;
  subLinks?: MenuLink[];
}

const ABOUT_SUB_LINKS: MenuLink[] = [
  { title: 'About Us', path: '/about-us', hasChildren: false },
  
];

const menu: MenuLink[] = [
  { title: 'HOME', path: '/', hasChildren: false },
  { title: 'ABOUT', path: '/about', hasChildren: true, subLinks: ABOUT_SUB_LINKS },
  { title: 'SHOP', path: '/search', hasChildren: true },
  { title: 'NEWS', path: '/news', hasChildren: true },
  { title: 'CONTACT', path: '/contact-us', hasChildren: false },
];

const PHONE_NUMBER = '+254 727 717 019';

/**
 * CategoryList: renders collections for mobile or desktop dropdown.
 * Desktop dropdown opening is controlled by parent via `openKey` / handlers.
 */
function CategoryList({
  collections,
  isMobile,
  openKey,
  openId,
  onOpen,
  onClose,
}: {
  collections: Collection[];
  isMobile: boolean;
  openKey?: string | null;
  openId?: string | null; // reserved for future use
  onOpen?: (key: string) => void;
  onClose?: () => void;
}) {
  const router = useRouter();

  const handleLinkClick = (handle: string) => router.push(`/search/${handle}`);

  const LinksContent = (
    <ul className="py-3">
      {collections.map((collection) => (
        <li key={collection.handle}>
          <a
            href={`/search/${collection.handle}`}
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick(collection.handle);
            }}
            className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition duration-150 ${
              isMobile ? 'mx-0' : 'rounded-md mx-2 my-1'
            }`}
          >
            <ShoppingBag className="w-4 h-4 mr-3 text-teal-600 flex-shrink-0" />
            <span className="truncate">{collection.title}</span>
          </a>
        </li>
      ))}
    </ul>
  );

  if (isMobile) {
    return (
      <div className="mt-4 border-t">
        <div className="px-4 py-2 font-semibold text-gray-700 bg-gray-50 flex items-center">
          <Menu className="w-5 h-5 mr-2" />
          <span className="uppercase text-xs tracking-wide">Categories</span>
        </div>
        {LinksContent}
      </div>
    );
  }

  // Desktop controlled dropdown: parent opens by key 'categories'
  const isOpen = openKey === 'categories';

  return (
    <div className="relative h-full" onMouseEnter={() => onOpen?.('categories')} onMouseLeave={() => onClose?.()}>
      <button
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="flex items-center justify-between h-full px-4 py-2 text-white bg-teal-600 font-semibold text-sm tracking-wide rounded-md shadow-md focus:outline-none"
      >
        <div className="flex items-center">
          <Menu className="w-4 h-4 mr-2" />
          <span className="uppercase">Categories</span>
        </div>
        <ChevronDown className={`w-4 h-4 ml-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <div
        className={`absolute left-0 mt-2 z-40 w-80 bg-white border border-gray-200 shadow-lg rounded-md p-2 transform transition-all duration-200 origin-top-left ${
          isOpen ? 'opacity-100 visible translate-y-0 pointer-events-auto' : 'opacity-0 invisible -translate-y-1 pointer-events-none'
        }`}
      >
        {/* invisible bridge to prevent hover-gap flicker */}
        <div className="absolute -top-2 left-0 right-0 h-2" />
        <div className="grid grid-cols-1 gap-1 max-h-72 overflow-auto">{LinksContent}</div>
      </div>
    </div>
  );
}

export default function FullCommerceNavbar({ collections }: { collections: Collection[] }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname() ?? "";
  
  
  if (pathname.startsWith("/dashboard/admin")) return null;

  // Dropdown controller (shared for all desktop dropdowns)
  const [openKey, setOpenKey] = useState<string | null>(null);
  const closeTimeout = useRef<number | null>(null);

  // clear timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeout.current) window.clearTimeout(closeTimeout.current);
    };
  }, []);

  const openDropdown = (key: string) => {
    if (closeTimeout.current) {
      window.clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setOpenKey(key);
  };

  const closeDropdownWithDelay = (delay = 180) => {
    if (closeTimeout.current) window.clearTimeout(closeTimeout.current);
    closeTimeout.current = window.setTimeout(() => setOpenKey(null), delay);
  };

  const handleLinkClick = (path: string) => {
    router.push(path);
    setIsDrawerOpen(false);
    setOpenKey(null);
  };

  // --- Mobile Collapsible Submenu ---
  const MobileSubmenuItem = ({ link }: { link: MenuLink }) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
      <li className="border-b">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="flex items-center justify-between w-full p-3 text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition"
          aria-expanded={isMobileOpen}
        >
          <span>{link.title}</span>
          <span className="text-xl leading-none text-gray-400 transition-transform duration-200">{isMobileOpen ? '–' : '+'}</span>
        </button>

        {isMobileOpen && (
          <ul className="bg-gray-50 py-1">
            {link.subLinks?.map((subLink) => (
              <li key={subLink.path}>
                <a
                  href={subLink.path}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(subLink.path);
                  }}
                  className="block px-6 py-2 text-sm text-gray-600 hover:bg-teal-100 hover:text-teal-700 transition"
                >
                  {subLink.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  // --- Desktop Hover Submenu (controlled by openKey) ---
  const DesktopSubmenuItem = ({ link }: { link: MenuLink }) => {
    const key = link.title.toLowerCase();
    const isOpen = openKey === key;

    return (
      <li
        className="h-full flex items-center relative"
        onMouseEnter={() => openDropdown(key)}
        onMouseLeave={() => closeDropdownWithDelay()}
      >
        <a
          href={link.path}
          onClick={(e) => e.preventDefault()}
          className="py-4 px-2 hover:text-teal-600 transition duration-150 flex items-center font-medium text-sm"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <span className="mr-2">{link.title}</span>
          <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </a>

        <div
          className={`absolute left-0 top-full mt-2 z-30 w-48 bg-white border border-gray-200 shadow-lg rounded-md p-2 transform transition-all duration-200 origin-top ${
            isOpen ? 'opacity-100 visible translate-y-0 pointer-events-auto' : 'opacity-0 invisible -translate-y-1 pointer-events-none'
          }`}
          onMouseEnter={() => openDropdown(key)}
          onMouseLeave={() => closeDropdownWithDelay()}
        >
          {/* invisible bridge */}
          <div className="absolute -top-2 left-0 right-0 h-2" />
          {link.subLinks?.map((subLink) => (
            <a
              key={subLink.path}
              href={subLink.path}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(subLink.path);
              }}
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 rounded"
            >
              {subLink.title}
            </a>
          ))}
        </div>
      </li>
    );
  };

  // --- Mobile Drawer ---
  const MobileDrawer = () => (
    <>
      {isDrawerOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsDrawerOpen(false)} />}

      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 overflow-y-auto lg:hidden ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!isDrawerOpen}
      >
        <div className="flex justify-between items-center p-3 border-b bg-gray-50">
          <div className="text-sm font-semibold">Menu</div>
          <button onClick={() => setIsDrawerOpen(false)} className="text-gray-500 hover:text-black p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav aria-label="Mobile main">
          <ul className="py-2">
            {menu.map((link) =>
              link.subLinks ? (
                <MobileSubmenuItem link={link} key={link.path} />
              ) : (
                <li key={link.path}>
                  <a
                    href={link.path}
                    onClick={(e) => {
                      e.preventDefault();
                      handleLinkClick(link.path);
                    }}
                    className="flex items-center justify-between p-3 text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition"
                  >
                    <span>{link.title}</span>
                    {link.hasChildren && <span className="text-xl leading-none text-gray-400">+</span>}
                  </a>
                </li>
              )
            )}
          </ul>

          <CategoryList collections={collections} isMobile={true} />

          <div className="p-4 border-t mt-4">
            <a href={`tel:${PHONE_NUMBER.replace(/[^0-9+]/g, '')}`} className="flex items-center text-teal-600 font-semibold text-base">
              <Phone className="w-5 h-5 mr-3" />
              <span className="break-keep">{PHONE_NUMBER}</span>
            </a>
          </div>
        </nav>
      </aside>
    </>
  );

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm relative z-20">
      <MobileDrawer />

      <div className="max-w-screen-xl mx-auto flex items-center justify-between h-16 px-4">
        {/* Left: Mobile toggle & Categories (desktop) */}
        <div className="flex items-center gap-3">
          <button
            className="p-2 lg:hidden text-gray-700 hover:text-black rounded-md"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open mobile menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden lg:flex items-center h-full">
            <CategoryList collections={collections} isMobile={false} openKey={openKey} onOpen={openDropdown} onClose={() => closeDropdownWithDelay()} />
          </div>
        </div>

        {/* Center: Navigation */}
        <ul className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-700 tracking-wide">
          {menu.map((link) =>
            link.subLinks ? (
              <DesktopSubmenuItem link={link} key={link.path} />
            ) : (
              <li key={link.path} className="h-full flex items-center">
                <a
                  href={link.path}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(link.path);
                  }}
                  className="py-3 px-2 hover:text-teal-600 transition duration-150"
                >
                  {link.title}
                </a>
              </li>
            )
          )}
        </ul>

        {/* Right: Phone / CTA */}
        <div className="hidden sm:flex items-center">
          <a
            href={`tel:${PHONE_NUMBER.replace(/[^0-9+]/g, '')}`}
            className="flex items-center gap-2 bg-teal-50 border border-teal-100 text-teal-700 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap shadow-sm hover:bg-teal-100 transition"
          >
            <Phone className="w-4 h-4" />
            <span className="select-none">{PHONE_NUMBER}</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
