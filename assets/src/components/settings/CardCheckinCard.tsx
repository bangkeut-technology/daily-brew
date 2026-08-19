import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { CreditCard, Trash2 } from 'lucide-react';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Toggle } from '@/components/shared/Toggle';
import { CustomSelect } from '@/components/shared/CustomSelect';
import { Avatar } from '@/components/shared/Avatar';
import { CardPassModal } from './CardPassModal';
import { CardRevokeModal } from './CardRevokeModal';
import {
  useEmployeeCards,
  useIssueEmployeeCard,
  useRevokeEmployeeCard,
} from '@/hooks/queries/useEmployeeCards';
import type { EmployeeCard, EmployeeCardIssueResult } from '@/types';
import { cn } from '@/lib/utils';

interface CardCheckinCardProps {
  workspacePublicId: string;
  employees: { publicId: string; name: string }[];
  enabled: boolean;
  onEnabledChange: (value: boolean) => void;
  canUseCardCheckin: boolean;
  onUpgrade: () => void;
  onSave: () => void;
  saving: boolean;
}

/** Pull an API error message out of an axios failure, falling back to a default. */
function messageOf(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
    if (message) return message;
  }
  return fallback;
}

/**
 * Card check-in settings: the workspace toggle, plus the cards in circulation.
 *
 * Issuing shows the pass bytes exactly once — the server derives them from the
 * card row and the workspace key and never stores them, so that modal is the
 * only chance to write a tag. Revoking is the only way to take a card back: the
 * signature stays valid until it expires, and the door has to be told.
 */
export function CardCheckinCard({
  workspacePublicId,
  employees,
  enabled,
  onEnabledChange,
  canUseCardCheckin,
  onUpgrade,
  onSave,
  saving,
}: CardCheckinCardProps) {
  const { t } = useTranslation();
  const active = enabled && canUseCardCheckin;

  const { data: cards } = useEmployeeCards(workspacePublicId, canUseCardCheckin);
  const issue = useIssueEmployeeCard(workspacePublicId);
  const revoke = useRevokeEmployeeCard(workspacePublicId);

  const [employeePublicId, setEmployeePublicId] = useState('');
  const [label, setLabel] = useState('');
  const [issued, setIssued] = useState<EmployeeCardIssueResult | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<EmployeeCard | null>(null);

  const employeeOptions = employees.map((e) => ({ value: e.publicId, label: e.name }));

  const handleIssue = async () => {
    if (!employeePublicId || !label.trim()) return;
    try {
      const result = await issue.mutateAsync({ employeePublicId, label: label.trim() });
      setIssued(result);
      setEmployeePublicId('');
      setLabel('');
    } catch (err: unknown) {
      toast.error(messageOf(err, t('settings.cardIssueError', 'Could not issue that card')));
    }
  };

  const handleRevoke = async (reason: string) => {
    if (!revokeTarget || !reason) return;
    try {
      await revoke.mutateAsync({ publicId: revokeTarget.publicId, reason });
      toast.success(t('settings.cardRevoked', 'Card revoked'));
      setRevokeTarget(null);
    } catch (err: unknown) {
      toast.error(messageOf(err, t('settings.cardRevokeError', 'Could not revoke that card')));
    }
  };

  return (
    <GlassCard hover={false} className="lg:col-span-2 scroll-mt-6" id="settings-card-checkin">
      <GlassCardHeader
        title={t('settings.cardCheckin', 'Card check-in')}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <CreditCard size={14} className="text-amber" />
            {active && <StatusBadge label={t('settings.activeBadge', 'Active')} variant="green" />}
          </div>
        }
      />
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Toggle
            id="card-checkin"
            checked={active}
            onChange={(v) => {
              if (!canUseCardCheckin) {
                onUpgrade();
                return;
              }
              onEnabledChange(v);
            }}
          />
          <label htmlFor="card-checkin" className="text-[15px] text-text-primary cursor-pointer">
            {t('settings.enableCardCheckin', 'Allow check-in by tapping a card')}
            {!canUseCardCheckin && (
              <span className="ml-1.5 text-[12.5px] font-medium px-2 py-0.5 rounded-full bg-amber/10 text-amber">
                Espresso
              </span>
            )}
          </label>
        </div>

        <p className="text-[14px] text-text-tertiary leading-relaxed">
          {t(
            'settings.cardCheckinDesc',
            'For staff without a phone. Each employee gets a card they tap on a kiosk at the door — no app and no account needed. A card is a key: whoever holds it can clock in with it, so keep the kiosk somewhere you can see it.',
          )}
        </p>

        {active && (
          <>
            <div className="border-t border-cream-3/70 pt-4 space-y-3">
              <p className="text-[13px] font-medium text-text-secondary">
                {t('settings.issueCard', 'Issue a card')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-end">
                <div>
                  <label htmlFor="card-employee" className="block text-[13px] text-text-tertiary mb-1">
                    {t('attendance.employee', 'Employee')}
                  </label>
                  <CustomSelect
                    value={employeePublicId}
                    onChange={setEmployeePublicId}
                    options={employeeOptions}
                    placeholder={t('attendance.selectEmployee', 'Select employee')}
                    renderOption={(opt, idx) => (
                      <>
                        <Avatar name={opt.label} index={idx} size={22} />
                        <span className="truncate">{opt.label}</span>
                      </>
                    )}
                  />
                </div>
                <div>
                  <label htmlFor="card-label" className="block text-[13px] text-text-tertiary mb-1">
                    {t('settings.cardLabel', 'Card name')}
                  </label>
                  <input
                    id="card-label"
                    name="cardLabel"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    maxLength={100}
                    placeholder={t('settings.cardLabelPlaceholder', 'e.g. Blue card')}
                    className="w-full px-3 py-2 rounded-lg text-[15px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee font-sans"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleIssue}
                  disabled={!employeePublicId || !label.trim() || issue.isPending}
                  className="px-4 py-2 rounded-lg text-[15px] font-medium text-white bg-coffee border-none cursor-pointer hover:bg-coffee-light transition-colors disabled:opacity-50"
                >
                  {issue.isPending ? t('common.loading', 'Loading...') : t('settings.issue', 'Issue')}
                </button>
              </div>
            </div>

            <div className="border-t border-cream-3/70 pt-4">
              {(cards?.length ?? 0) === 0 ? (
                <p className="text-[14px] text-text-tertiary text-center py-6">
                  {t('settings.noCards', 'No cards yet — issue one above, then hold a blank card to the kiosk to write it.')}
                </p>
              ) : (
                <ul className="space-y-2">
                  {cards?.map((card, index) => (
                    <li
                      key={card.publicId}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl bg-glass-bg border border-cream-3',
                        card.revokedAt && 'opacity-60',
                      )}
                    >
                      <Avatar name={card.employeeName ?? '?'} index={index} size={26} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[14.5px] text-text-primary truncate">
                          {card.employeeName}
                          <span className="text-text-tertiary"> · {card.label}</span>
                        </p>
                        {card.revokedAt ? (
                          <p className="text-[12.5px] text-text-tertiary truncate">
                            {t('settings.cardRevokedBy', 'Revoked by {{email}}', {
                              email: card.revokedByEmail ?? '—',
                            })}
                            {card.revokeReason ? ` · ${card.revokeReason}` : ''}
                          </p>
                        ) : (
                          <p className="text-[12.5px] text-text-tertiary font-mono tabular-nums">
                            {card.publicId}
                          </p>
                        )}
                      </div>
                      {card.revokedAt ? (
                        <StatusBadge label={t('settings.cardRevokedBadge', 'Revoked')} variant="gray" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setRevokeTarget(card)}
                          aria-label={t('settings.revokeCard', 'Revoke card')}
                          className="w-7 h-7 rounded-lg flex items-center justify-center bg-transparent border-none cursor-pointer text-text-tertiary hover:text-red hover:bg-red/10 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {canUseCardCheckin && (
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-[15px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light disabled:opacity-50"
          >
            {saving ? t('common.loading', 'Loading...') : t('common.save', 'Save')}
          </button>
        )}
      </div>

      <CardPassModal issued={issued} onClose={() => setIssued(null)} />

      <CardRevokeModal
        card={revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
        onConfirm={handleRevoke}
        loading={revoke.isPending}
      />
    </GlassCard>
  );
}
