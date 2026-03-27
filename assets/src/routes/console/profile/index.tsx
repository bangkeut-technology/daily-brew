import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuthentication } from '@/hooks/use-authentication';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { Avatar } from '@/components/shared/Avatar';

export const Route = createFileRoute('/console/profile/')({
    component: ProfilePage,
});

function ProfilePage() {
    const { t } = useTranslation();
    const { user } = useAuthentication();

    return (
        <div className="page-enter">
            <PageHeader title={t('nav.profile')} />

            <GlassCard hover={false} className="max-w-md">
                <GlassCardHeader title="Account" />
                <div className="p-6 flex flex-col items-center">
                    <Avatar name={user?.email || 'U'} index={0} size={64} radius="20px" />
                    <p className="text-[16px] font-semibold text-text-primary mt-3">{user?.email}</p>
                    <p className="text-[12px] text-text-tertiary mt-1">Owner</p>
                </div>
            </GlassCard>
        </div>
    );
}
