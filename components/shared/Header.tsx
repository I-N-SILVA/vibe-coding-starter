"use client";

import { useAuth } from '@/lib/auth/AuthProvider';
import { LandingHeader, LandingHeaderMenuItem } from '@/components/landing';
import ThemeSwitch from '@/components/shared/ThemeSwitch';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export const Header = ({ className }: { className?: string }) => {
  const { isAuthenticated, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/'); // Redirect to home page after sign out
  };

  return (
    <LandingHeader
      className={className}
      fixed
      withBackground
      variant="primary"
      logoComponent={
        <div className="flex items-center text-primary-500 dark:text-primary-500 gap-3">
          <span className="font-bold text-lg tracking-widest">PLYAZ</span>
        </div>
      }
    >
      <LandingHeaderMenuItem href="/features">
        {'Features'}
      </LandingHeaderMenuItem>
      <LandingHeaderMenuItem href="/pricing">{'Pricing'}</LandingHeaderMenuItem>
      <LandingHeaderMenuItem href="/security">
        {'Security'}
      </LandingHeaderMenuItem>
      <LandingHeaderMenuItem href="/help">{'Help'}</LandingHeaderMenuItem>
      <LandingHeaderMenuItem type="button" href="/league">
        Dashboard
      </LandingHeaderMenuItem>

      {isAuthenticated ? (
        <LandingHeaderMenuItem type="button" onClick={handleSignOut}>
          Sign Out
        </LandingHeaderMenuItem>
      ) : (
        <LandingHeaderMenuItem type="button" href="/login">
          Sign In
        </LandingHeaderMenuItem>
      )}

      <ThemeSwitch />
    </LandingHeader>
  );
};

export default Header;

