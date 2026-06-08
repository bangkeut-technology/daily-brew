import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronDown, LogOut, UserCircle, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthenticationState } from '@/hooks/use-authentication';
import { Avatar } from '@/components/shared/Avatar';
import { cn } from '@/lib/utils';

/**
 * Topbar avatar trigger with a dropdown menu. Replaces the standalone
 * Profile + Sign out buttons that used to live at the bottom of the sidebar.
 * Sign-out submits a form POST so the browser follows the redirect and
 * processes the JWT clear cookies — same flow as the prior sidebar button.
 */
export function UserAvatarMenu() {
  const { t } = useTranslation();
  const auth = useAuthenticationState();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node)
        || menuRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const user = auth.user;
  const displayName = user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || '';
  const isSuperAdmin = user?.isSuperAdmin ?? false;

  const signOut = () => {
    sessionStorage.removeItem('workspace_public_id');
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/api/v1/${sessionStorage.getItem('locale') || 'en'}/auth/logout`;
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg cursor-pointer bg-transparent border border-transparent transition-colors hover:bg-cream-3/40"
        aria-label={t('nav.userMenu', 'User menu')}
      >
        <Avatar name={displayName} imageUrl={user?.avatarUrl} index={0} size={28} />
        <ChevronDown size={14} className={cn('text-text-tertiary transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-2 z-50 min-w-[220px] rounded-xl border border-cream-3 bg-cream shadow-lg overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-cream-3/60">
            {displayName && (
              <div className="text-[13.5px] font-medium text-text-primary truncate">{displayName}</div>
            )}
            {user?.email && (
              <div className="text-[12px] text-text-tertiary truncate">{user.email}</div>
            )}
          </div>
          <div className="py-1">
            <Link
              to="/console/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-[14px] text-text-primary hover:bg-glass-bg no-underline transition-colors"
            >
              <UserCircle size={15} />
              {t('nav.profile', 'Profile')}
            </Link>
            {isSuperAdmin && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-[14px] text-coffee hover:bg-coffee/8 no-underline transition-colors"
              >
                <ShieldCheck size={15} />
                {t('nav.adminPanel', 'Admin panel')}
              </Link>
            )}
            <button
              type="button"
              onClick={signOut}
              className="flex items-center gap-2.5 w-full px-4 py-2 text-[14px] text-text-primary bg-transparent border-none cursor-pointer text-left hover:bg-glass-bg transition-colors"
            >
              <LogOut size={15} />
              {t('nav.signOut', 'Sign out')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
