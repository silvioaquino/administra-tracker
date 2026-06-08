import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { UserMenu } from '@/components/layout/UserMenu';

const AppLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const { name, handle, role } = session.user;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
          <div className="flex items-center gap-2">
            <MobileMenu />
            <p className="text-sm font-medium text-muted-foreground md:hidden">
              Administra.ai · QA
            </p>
          </div>
          <div className="ml-auto">
            <UserMenu name={name ?? 'Usuário'} handle={handle} role={role} />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;