import Navbar from '@/components/layouts/navbar';
import { currentRole } from '@/lib/auth';
import { cn } from '@/lib/utils';
import React from 'react';
import Sidebar from './components/sidebar';
import { UserRole } from '@prisma/client';
import { IoMdHome } from 'react-icons/io';
import { MdLibraryBooks } from 'react-icons/md';
import { CgOrganisation } from 'react-icons/cg';
import { MdPayment } from 'react-icons/md';
import { MdTask } from 'react-icons/md';
import { ImUsers } from 'react-icons/im';
import { BiSolidReport } from 'react-icons/bi';
import { SidebarLink } from '@/types/nav-links.types';
import { LandPlot } from 'lucide-react';

const navLinks = (userRole?: UserRole): SidebarLink[] => {
  const dashboard: SidebarLink[] = [
    {
      href: '/',
      label: 'Dashboard',
      icon: <IoMdHome size="18" className="mr-1" />,
    },

    {
      href: '/applications',
      label: 'Applications',
      icon: <MdLibraryBooks size="18" className="mr-1" />,
    },
    {
      href: '/payments',
      label: 'Payments',
      icon: <MdPayment size="18" className="mr-1" />,
    },
  ];
  const adminLinks: SidebarLink[] = [
    {
      href: '/participants',
      label: 'Participants',
      icon: <ImUsers size="18" className="mr-1" />,
    },
    {
      href: '/completed-programs/admin',
      label: 'Completed courses',
      icon: <MdTask size="18" className="mr-1" />,
    },
    {
      href: '/organizations/admin',
      label: 'Organizations',
      icon: <CgOrganisation size="18" className="mr-1" />,
    },
    {
      href: '/new-program',
      label: 'New program',
      icon: <MdLibraryBooks size="18" className="mr-1" />,
    },
    {
      href: 'reports',
      label: 'Reports',
      icon: <BiSolidReport size="18" className="mr-1" />,
    },
  ];
  const userLinks: SidebarLink[] = [
    {
      href: '/new-inhouse-training',
      label: 'In house training',
      icon: <LandPlot size="18" className="mr-1" />,
    },
    {
      href: '/organizations',
      label: 'Organizations',
      icon: <CgOrganisation size="18" className="mr-1" />,
    },
    {
      href: '/new-organization',
      label: 'Organizations',
      icon: <CgOrganisation size="18" className="mr-1" />,
    },
    {
      href: '/completed-programs',
      label: 'Completed courses',
      icon: <MdTask size="18" className="mr-1" />,
    },
  ];

  if (userRole === UserRole.ADMIN) {
    return [...dashboard, ...adminLinks];
  } else if (userRole === UserRole.USER) {
    return [...dashboard, ...userLinks];
  } else {
    return [];
  }
};

const PortalLayout = async ({ children }: { children: React.ReactNode }) => {
  const userRole = await currentRole();
  const isLoggedIn = userRole !== undefined;
  const links = navLinks(userRole);
  return (
    <main className="flex h-screen flex-col">
      <Navbar />
      <section className="grid flex-1 grid-cols-6 overflow-x-hidden">
        {isLoggedIn && <Sidebar links={links} />}
        <div
          className={cn(
            'sticky col-span-5 flex flex-col overflow-y-auto bg-neutral-100',
            isLoggedIn && 'md:col-span-5',
          )}
        >
          {children}
          <footer className="self-center py-8 text-sm font-semibold">
            Copyright @{new Date().getFullYear()} Kenya Institute of Public
            Policy Research and Analysis
          </footer>
        </div>
      </section>
    </main>
  );
};

export default PortalLayout;
