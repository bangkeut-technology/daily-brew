import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Popover from '@radix-ui/react-popover';
import * as Dialog from '@radix-ui/react-dialog';
import { ChevronsUpDown, Check, Plus, X, Building2 } from 'lucide-react';
import { getWorkspacePublicId, setWorkspacePublicId } from '@/lib/auth';
import { useCreateWorkspace } from '@/hooks/queries/useWorkspaces';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface WorkspaceItem {
  publicId: string;
  name: string;
  role: 'owner' | 'manager' | 'employee';
}

interface WorkspaceSwitcherProps {
  workspaces: WorkspaceItem[];
  planLabel?: string;
  isEspresso?: boolean;
}

export function WorkspaceSwitcher({ workspaces, planLabel, isEspresso }: WorkspaceSwitcherProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const createWs = useCreateWorkspace();

  const currentId = getWorkspacePublicId();
  const current = workspaces.find((ws) => ws.publicId === currentId);

  const handleSwitch = (publicId: string) => {
    if (publicId === currentId) {
      setOpen(false);
      return;
    }
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
      toast.error(t('workspace.createFailed'));
    }
  };

  return (
    <>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            className="
              w-full flex items-center gap-2 px-2.5 py-2 rounded-lg
              text-left cursor-pointer
              bg-transparent border border-transparent
              hover:bg-cream-3 transition-all duration-[180ms]
            "
          >
            <div className="w-7 h-7 rounded-lg bg-coffee/10 flex items-center justify-center flex-shrink-0">
              <span className="text-[13px] font-semibold text-coffee">
                {(current?.name ?? '?').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14.5px] font-semibold text-text-primary leading-tight break-words">
                {current?.name ?? t('workspace.noWorkspace')}
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-[12px] text-text-tertiary leading-tight shrink-0">
                  {current?.role === 'manager' ? 'Manager' : current?.role === 'employee' ? 'Employee' : t('workspace.label')}
                </p>
                {planLabel && (
                  <span className={cn(
                    'text-[10px] font-semibold px-1.5 py-px rounded-full truncate max-w-[90px]',
                    isEspresso ? 'bg-green/10 text-green' : 'bg-cream-3 text-text-tertiary'
                  )}>
                    {planLabel}
                  </span>
                )}
              </div>
            </div>
            <ChevronsUpDown size={14} className="text-text-tertiary flex-shrink-0" />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            side="bottom"
            align="start"
            sideOffset={4}
            className="
              w-[200px] max-h-[280px] overflow-y-auto
              bg-cream-2 border border-cream-3 rounded-xl
              shadow-[0_8px_30px_rgba(107,66,38,0.12)]
              p-1.5 z-50
            "
          >
            {workspaces.map((ws) => (
              <button
                key={ws.publicId}
                onClick={() => handleSwitch(ws.publicId)}
                className={cn(
                  'w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left cursor-pointer border-none text-[14.5px] font-sans transition-colors duration-[120ms]',
                  ws.publicId === currentId
                    ? 'bg-glass-bg text-coffee font-medium'
                    : 'bg-transparent text-text-primary hover:bg-cream-3'
                )}
              >
                <div className="w-6 h-6 rounded-md bg-coffee/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[12px] font-semibold text-coffee">
                    {ws.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block truncate">{ws.name}</span>
                  <span className="text-[11px] text-text-tertiary">{ws.role === 'owner' ? 'Owner' : ws.role === 'manager' ? 'Manager' : 'Employee'}</span>
                </div>
                {ws.publicId === currentId && (
                  <Check size={14} className="text-coffee flex-shrink-0" />
                )}
              </button>
            ))}

            <div className="my-1.5 border-t border-cream-3" />

            <button
              onClick={() => {
                setOpen(false);
                setModalOpen(true);
              }}
              className="
                w-full flex items-center gap-2 px-2.5 py-2 rounded-lg
                text-left cursor-pointer border-none bg-transparent
                text-[14.5px] text-text-secondary font-sans
                hover:bg-cream-3 hover:text-text-primary transition-colors duration-[120ms]
              "
            >
              <Plus size={14} />
              {t('workspace.create')}
            </button>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <Dialog.Root open={modalOpen} onOpenChange={(v) => { setModalOpen(v); if (!v) setNewName(''); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-[400px] bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl shadow-[0_16px_50px_rgba(107,66,38,0.15)] outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-coffee/10 flex items-center justify-center">
                  <Building2 size={20} className="text-coffee" />
                </div>
                <div>
                  <Dialog.Title className="text-[18px] font-semibold text-text-primary font-serif">
                    {t('workspace.create')}
                  </Dialog.Title>
                  <Dialog.Description className="text-[14px] text-text-secondary">
                    {t('workspace.newPlaceholder')}
                  </Dialog.Description>
                </div>
              </div>

              <form onSubmit={handleCreate}>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t('workspace.newPlaceholder')}
                  autoFocus
                  className="w-full px-3 py-2.5 rounded-lg text-[15.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-1 focus:ring-coffee/20 transition-all mb-4"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setModalOpen(false); setNewName(''); }}
                    className="px-4 py-2 rounded-lg text-[15px] font-medium bg-transparent text-text-secondary border border-cream-3 cursor-pointer hover:bg-cream-3 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={createWs.isPending || !newName.trim()}
                    className="px-4 py-2 rounded-lg text-[15px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light disabled:opacity-50 transition-colors"
                  >
                    {createWs.isPending ? t('common.loading') : t('common.create')}
                  </button>
                </div>
              </form>
            </div>

            <Dialog.Close className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center bg-transparent border-none text-text-tertiary hover:text-text-secondary hover:bg-cream-3/40 cursor-pointer transition-all">
              <X size={15} />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
