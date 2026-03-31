import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import * as Dialog from '@radix-ui/react-dialog';
import { Building2, UserCircle, Plus, ArrowRight } from 'lucide-react';
import { setWorkspacePublicId } from '@/lib/auth';
import { useCreateWorkspace } from '@/hooks/queries/useWorkspaces';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { RoleContext } from '@/types';

interface WorkspaceSelectorModalProps {
  open: boolean;
  roleContext: RoleContext;
}

export function WorkspaceSelectorModal({ open, roleContext }: WorkspaceSelectorModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createWs = useCreateWorkspace();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');

  const allWorkspaces = [
    ...roleContext.ownedWorkspaces.map((w) => ({ ...w, role: 'owner' as const })),
    ...roleContext.linkedWorkspaces
      .filter((lw) => lw.workspacePublicId !== null)
      .filter((lw) => !roleContext.ownedWorkspaces.some((ow) => ow.publicId === lw.workspacePublicId))
      .map((lw) => ({
        publicId: lw.workspacePublicId!,
        name: lw.workspaceName ?? '',
        role: 'employee' as const,
      })),
  ];

  const hasWorkspaces = allWorkspaces.length > 0;

  const handleSelect = (publicId: string) => {
    setWorkspacePublicId(publicId);
    window.location.reload();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    try {
      const ws = await createWs.mutateAsync(name);
      setWorkspacePublicId(ws.publicId);
      window.location.reload();
    } catch {
      toast.error(t('workspace.createFailed', 'Failed to create workspace'));
    }
  };

  // No workspaces and onboarding not complete → send to onboarding
  if (!roleContext.onboardingCompleted) {
    if (open) {
      navigate({ to: '/onboarding', replace: true });
    }
    return null;
  }

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-[460px] bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl shadow-[0_16px_50px_rgba(107,66,38,0.15)] outline-none"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-amber to-coffee shadow-[0_3px_10px_rgba(107,66,38,0.20)]">
                <Building2 size={24} color="white" strokeWidth={1.8} />
              </div>
              <Dialog.Title className="text-[22px] font-semibold text-text-primary font-serif">
                {hasWorkspaces
                  ? t('workspace.selectTitle', 'Select a workspace')
                  : t('workspace.noWorkspacesTitle', 'No workspace found')}
              </Dialog.Title>
              <Dialog.Description className="text-[15px] text-text-secondary mt-1">
                {hasWorkspaces
                  ? t('workspace.selectDescription', 'Choose a workspace to continue')
                  : t('workspace.noWorkspacesDescription', 'Create a workspace or ask your employer to link you')}
              </Dialog.Description>
            </div>

            {hasWorkspaces && (
              <div className="space-y-1.5 mb-4 max-h-[240px] overflow-y-auto">
                {allWorkspaces.map((ws) => (
                  <button
                    key={ws.publicId}
                    onClick={() => handleSelect(ws.publicId)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left cursor-pointer border border-cream-3 bg-glass-bg text-[15px] font-sans transition-all duration-150 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.1)] hover:border-coffee/30"
                  >
                    <div className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                      ws.role === 'owner' ? 'bg-coffee/10' : 'bg-blue/10',
                    )}>
                      {ws.role === 'owner'
                        ? <Building2 size={16} className="text-coffee" />
                        : <UserCircle size={16} className="text-blue" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-[15px] font-medium text-text-primary truncate">{ws.name}</span>
                      <span className="text-[12.5px] text-text-tertiary">
                        {ws.role === 'owner' ? 'Owner' : 'Employee'}
                      </span>
                    </div>
                    <ArrowRight size={14} className="text-text-tertiary flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {showCreateForm ? (
              <form onSubmit={handleCreate} className="space-y-3">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t('workspace.newPlaceholder', 'Restaurant name')}
                  autoFocus
                  className="w-full px-3 py-2.5 rounded-lg text-[15.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-1 focus:ring-coffee/20 transition-all"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={createWs.isPending || !newName.trim()}
                    className="flex-1 px-4 py-2.5 rounded-lg text-[15px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light disabled:opacity-50 transition-colors"
                  >
                    {createWs.isPending ? t('common.loading') : t('common.create')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowCreateForm(false); setNewName(''); }}
                    className="px-4 py-2.5 rounded-lg text-[15px] font-medium bg-transparent text-text-secondary border border-cream-3 cursor-pointer hover:bg-cream-3 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[15px] font-medium bg-glass-bg border border-dashed border-cream-3 text-text-secondary cursor-pointer hover:bg-cream-3/40 hover:text-text-primary transition-all"
              >
                <Plus size={14} />
                {t('workspace.create', 'Create workspace')}
              </button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
