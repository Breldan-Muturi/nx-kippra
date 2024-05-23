import Navbar from '@/app/(portal)/components/navbar';
import { currentRole } from '@/lib/auth';
import { SidebarLink } from '@/types/nav-links.types';
import { UserRole } from '@prisma/client';
import { FilePlus2, FolderPlus, GraduationCap } from 'lucide-react';
import React from 'react';
import { BiSolidReport } from 'react-icons/bi';
import { CgOrganisation } from 'react-icons/cg';
import { ImUsers } from 'react-icons/im';
import { MdLibraryBooks, MdPayment, MdTask } from 'react-icons/md';
import ContentArea from './components/content';
import MobileNav from './components/sidebar/mobile-sidebar';
import SideBarArea from './components/sidebar/side-bar';

const navLinks: SidebarLink[] = [
  {
    href: '/',
    label: 'Programs',
    icon: <GraduationCap size="18" className="mr-1" />,
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
    href: '/organizations',
    label: 'Organizations',
    icon: <CgOrganisation size="18" className="mr-1" />,
  },
  {
    href: '/new-organization',
    label: 'New Organization',
    icon: <FolderPlus size="18" className="mr-1" />,
  },
  {
    href: '/new-program',
    label: 'New program',
    icon: <MdLibraryBooks size="18" className="mr-1" />,
    role: UserRole.ADMIN,
  },
  {
    href: '/completed-programs',
    label: 'Completed programs',
    icon: <MdTask size="18" className="mr-1" />,
  },
  {
    href: '/reports',
    label: 'Reports',
    icon: <BiSolidReport size="18" className="mr-1" />,
    role: UserRole.ADMIN,
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
    <main className="flex flex-col h-screen">
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
