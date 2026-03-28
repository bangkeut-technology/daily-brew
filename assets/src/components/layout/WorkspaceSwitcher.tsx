import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Popover from '@radix-ui/react-popover';
import { ChevronsUpDown, Check, Plus } from 'lucide-react';
import { getWorkspacePublicId, setWorkspacePublicId } from '@/lib/auth';
import { useCreateWorkspace } from '@/hooks/queries/useWorkspaces';
import { toast } from 'sonner';

interface WorkspaceSwitcherProps {
  workspaces: { publicId: string; name: string }[];
}

export function WorkspaceSwitcher({ workspaces }: WorkspaceSwitcherProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
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

  if (workspaces.length === 0) return null;

  return (
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
            <span className="text-[11px] font-semibold text-coffee">
              {(current?.name ?? '?').charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-medium text-text-primary truncate leading-tight">
              {current?.name ?? t('workspace.noWorkspace')}
            </p>
            <p className="text-[10px] text-text-tertiary leading-tight">
              {t('workspace.label')}
            </p>
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
              className={`
                w-full flex items-center gap-2 px-2.5 py-2 rounded-lg
                text-left cursor-pointer border-none
                text-[12.5px] font-sans transition-colors duration-[120ms]
                ${
                  ws.publicId === currentId
                    ? 'bg-glass-bg text-coffee font-medium'
                    : 'bg-transparent text-text-primary hover:bg-cream-3'
                }
              `}
            >
              <div className="w-6 h-6 rounded-md bg-coffee/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-semibold text-coffee">
                  {ws.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="flex-1 truncate">{ws.name}</span>
              {ws.publicId === currentId && (
                <Check size={14} className="text-coffee flex-shrink-0" />
              )}
            </button>
          ))}

          <div className="my-1.5 border-t border-cream-3" />

          {creating ? (
            <form onSubmit={handleCreate} className="px-1">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t('workspace.newPlaceholder')}
                autoFocus
                className="
                  w-full px-2.5 py-1.5 rounded-lg text-[12px]
                  bg-glass-bg border border-cream-3 text-text-primary
                  outline-none focus:border-coffee font-sans mb-1
                "
              />
              <div className="flex gap-1.5">
                <button
                  type="submit"
                  disabled={createWs.isPending}
                  className="flex-1 px-2 py-1 rounded-md text-[11px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light disabled:opacity-50"
                >
                  {t('common.create')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setNewName('');
                  }}
                  className="px-2 py-1 rounded-md text-[11px] text-text-secondary bg-transparent border border-cream-3 cursor-pointer hover:bg-cream-3"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="
                w-full flex items-center gap-2 px-2.5 py-2 rounded-lg
                text-left cursor-pointer border-none bg-transparent
                text-[12.5px] text-text-secondary font-sans
                hover:bg-cream-3 hover:text-text-primary transition-colors duration-[120ms]
              "
            >
              <Plus size={14} />
              {t('workspace.create')}
            </button>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
