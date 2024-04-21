import Navbar from '@/app/(portal)/components/navbar';
import { currentRole } from '@/lib/auth';
import React from 'react';
import { UserRole } from '@prisma/client';
import { IoMdHome } from 'react-icons/io';
import { MdLibraryBooks } from 'react-icons/md';
import { CgOrganisation } from 'react-icons/cg';
import { MdPayment } from 'react-icons/md';
import { MdTask } from 'react-icons/md';
import { ImUsers } from 'react-icons/im';
import { BiSolidReport } from 'react-icons/bi';
import { FilePlus2, FolderPlus, LandPlot } from 'lucide-react';
import ContentArea from './components/content';
import SideBarArea from './components/sidebar/side-bar';
import { SidebarLink } from '@/types/nav-links.types';
import MobileNav from './components/sidebar/mobile-sidebar';

const navLinks: SidebarLink[] = [
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
    href: '/new-application',
    label: 'New application',
    icon: <FilePlus2 size="18" className="mr-1" />,
    role: UserRole.ADMIN,
  },
  {
    href: '/payments',
    label: 'Payments',
    icon: <MdPayment size="18" className="mr-1" />,
  },
  {
    href: '/participants',
    label: 'Participants',
    icon: <ImUsers size="18" className="mr-1" />,
    role: UserRole.ADMIN,
  },
  {
    href: '/completed-programs/admin',
    label: 'Completed courses',
    icon: <MdTask size="18" className="mr-1" />,
    role: UserRole.ADMIN,
  },
  {
    href: '/organizations/admin',
    label: 'Organizations',
    icon: <CgOrganisation size="18" className="mr-1" />,
    role: UserRole.ADMIN,
  },
  {
    href: '/new-program',
    label: 'New program',
    icon: <MdLibraryBooks size="18" className="mr-1" />,
    role: UserRole.ADMIN,
  },
  {
    href: 'reports',
    label: 'Reports',
    icon: <BiSolidReport size="18" className="mr-1" />,
    role: UserRole.ADMIN,
  },
  {
    href: '/new-inhouse-training',
    label: 'In house training',
    icon: <LandPlot size="18" className="mr-1" />,
    role: UserRole.USER,
  },
  {
    href: '/organizations',
    label: 'Organizations',
    icon: <CgOrganisation size="18" className="mr-1" />,
    role: UserRole.USER,
  },
  {
    href: '/new-organization',
    label: 'New Organization',
    icon: <FolderPlus size="18" className="mr-1" />,
    role: UserRole.USER,
  },
  {
    href: '/completed-programs',
    label: 'Completed programs',
    icon: <MdTask size="18" className="mr-1" />,
    role: UserRole.USER,
  },
];

const getLinksForRole = (userRole?: UserRole): SidebarLink[] => {
  return navLinks.filter(({ role }) => !role || role === userRole);
};

const PortalLayout = async ({ children }: { children: React.ReactNode }) => {
  const userRole = await currentRole();
  const isLoggedIn = userRole !== undefined;
  const links = getLinksForRole(userRole);
  return (
    <main className="flex h-screen flex-col">
      <Navbar />
      <section className="flex flex-1 h-full overflow-hidden">
        {isLoggedIn && (
          <>
            <SideBarArea links={links} className="hidden md:flex" />
            <MobileNav links={links} className="flex md:hidden" />
          </>
        )}
        <ContentArea>{children}</ContentArea>
      </section>
    </main>
  );
};

export default PortalLayout;
