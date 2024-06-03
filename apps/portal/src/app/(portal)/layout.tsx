import Navbar from '@/app/(portal)/components/navbar';
import { currentRole } from '@/lib/auth';
import { ExternalNav, SidebarLink } from '@/types/nav-links.types';
import { UserRole } from '@prisma/client';
import { FilePlus2, FolderPlus, GraduationCap } from 'lucide-react';
import React from 'react';
import { BiSolidReport } from 'react-icons/bi';
import { CgOrganisation } from 'react-icons/cg';
import { ImUsers } from 'react-icons/im';
import { MdLibraryBooks, MdPayment, MdTask } from 'react-icons/md';
import ContentArea from './components/content';
import SideBarArea from './components/sidebar/side-bar';

const sideLinks: SidebarLink[] = [
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

const navLinks: ExternalNav[] = [
  {
    label: 'About us',
    href: 'https://kippra.or.ke',
  },
  {
    label: 'Contact us',
    href: 'https://kippra.or.ke',
  },
  {
    label: 'Portal User Guide',
    href: 'https://kippra.or.ke',
  },
  {
    label: 'eLearning',
    href: 'https://kippra.or.ke',
  },
];

const getLinksForRole = (userRole?: UserRole): SidebarLink[] => {
  return sideLinks.filter(({ role }) => !role || role === userRole);
};

const PortalLayout = async ({ children }: { children: React.ReactNode }) => {
  const userRole = await currentRole();
  const isLoggedIn = userRole !== undefined;
  const links = getLinksForRole(userRole);
  return (
    <main className="flex flex-col h-screen">
      <Navbar links={links} navLinks={navLinks} />
      <section className="flex flex-1 h-full overflow-auto lg:overflow-hidden">
        {isLoggedIn && (
          <>
            <SideBarArea
              links={links}
              navLinks={navLinks}
              className="hidden md:flex"
            />
          </>
        )}
        <ContentArea>{children}</ContentArea>
      </section>
    </main>
  );
};

export default PortalLayout;
