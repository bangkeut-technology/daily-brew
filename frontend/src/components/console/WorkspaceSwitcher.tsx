"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronsUpDown, Check, Plus, X, Building2 } from "lucide-react";
import { toast } from "sonner";
import { getWorkspacePublicId, setWorkspacePublicId } from "@/lib/api";
import { useCreateWorkspace } from "@/hooks/useWorkspaces";
import { cn } from "@/lib/utils";

interface WorkspaceItem {
  publicId: string;
  name: string;
  role: "owner" | "manager" | "employee";
}

interface Props {
  workspaces: WorkspaceItem[];
  planLabel?: string;
  isEspresso?: boolean;
}

export function WorkspaceSwitcher({ workspaces, planLabel, isEspresso }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const createWs = useCreateWorkspace();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Hand-rolled click-outside rather than a popover library: the Next bundle
  // has no popover primitive, and this matches ShiftPopover / UserAvatarMenu.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const currentId = getWorkspacePublicId();
  const current = workspaces.find((ws) => ws.publicId === currentId);

  const roleLabel = (role: WorkspaceItem["role"]) =>
    role === "manager"
      ? t("employee.roleManager", "Manager")
      : role === "employee"
        ? t("employee.roleEmployee", "Employee")
        : t("employee.roleOwner", "Owner");

  const handleSwitch = (publicId: string) => {
    if (publicId === currentId) {
      setOpen(false);
      return;
    }
    setWorkspacePublicId(publicId);
    // Full reload rather than a router push: every workspace-scoped query is
    // cached under the old id, and the console reads the id synchronously at
    // render. Reloading is what guarantees nothing keeps showing stale data.
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
      toast.error(t("workspace.createFailed", "Failed to create workspace"));
    }
  };

  return (
    <>
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="menu"
          className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-transparent bg-transparent px-2.5 py-2 text-left transition-all duration-[180ms] hover:bg-cream-3"
        >
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-coffee/10">
            <span className="text-[13px] font-semibold text-coffee">
              {(current?.name ?? "?").charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="break-words text-[14.5px] font-semibold leading-tight text-text-primary">
              {current?.name ?? t("workspace.noWorkspace", "No workspace")}
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="shrink-0 text-[12px] leading-tight text-text-tertiary">
                {roleLabel(current?.role ?? "owner")}
              </p>
              {planLabel && (
                <span
                  className={cn(
                    "max-w-[90px] truncate rounded-full px-1.5 py-px text-[10px] font-semibold",
                    isEspresso ? "bg-green/10 text-green" : "bg-cream-3 text-text-tertiary",
                  )}
                >
                  {planLabel}
                </span>
              )}
            </div>
          </div>
          <ChevronsUpDown size={14} className="flex-shrink-0 text-text-tertiary" />
        </button>

        {open && (
          <div
            ref={menuRef}
            role="menu"
            // Full trigger width so the menu lines up under it, with a 200px
            // floor so a narrow trigger (mobile) still fits the workspace names.
            className="absolute left-0 top-full z-50 mt-1 max-h-[280px] w-full min-w-[200px] overflow-y-auto rounded-xl border border-cream-3 bg-cream-2 p-1.5 shadow-[0_8px_30px_rgba(107,66,38,0.12)]"
          >
            {workspaces.map((ws) => (
              <button
                key={ws.publicId}
                type="button"
                onClick={() => handleSwitch(ws.publicId)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 rounded-lg border-none px-2.5 py-2 text-left font-sans text-[14.5px] transition-colors duration-[120ms]",
                  ws.publicId === currentId
                    ? "bg-glass-bg font-medium text-coffee"
                    : "bg-transparent text-text-primary hover:bg-cream-3",
                )}
              >
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-coffee/10">
                  <span className="text-[12px] font-semibold text-coffee">
                    {ws.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block truncate">{ws.name}</span>
                  <span className="text-[11px] text-text-tertiary">{roleLabel(ws.role)}</span>
                </div>
                {ws.publicId === currentId && (
                  <Check size={14} className="flex-shrink-0 text-coffee" />
                )}
              </button>
            ))}

            <div className="my-1.5 border-t border-cream-3" />

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setModalOpen(true);
              }}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg border-none bg-transparent px-2.5 py-2 text-left font-sans text-[14.5px] text-text-secondary transition-colors duration-[120ms] hover:bg-cream-3 hover:text-text-primary"
            >
              <Plus size={14} />
              {t("workspace.create", "Create workspace")}
            </button>
          </div>
        )}
      </div>

      <Dialog.Root
        open={modalOpen}
        onOpenChange={(v) => {
          setModalOpen(v);
          if (!v) setNewName("");
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-glass-border bg-glass-bg shadow-[0_16px_50px_rgba(107,66,38,0.15)] outline-none backdrop-blur-xl">
            <div className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coffee/10">
                  <Building2 size={20} className="text-coffee" />
                </div>
                <div>
                  <Dialog.Title className="font-serif text-[18px] font-semibold text-text-primary">
                    {t("workspace.create", "Create workspace")}
                  </Dialog.Title>
                  <Dialog.Description className="text-[14px] text-text-secondary">
                    {t("workspace.newPlaceholder", "Restaurant name")}
                  </Dialog.Description>
                </div>
              </div>

              <form onSubmit={handleCreate}>
                <input
                  id="new-workspace-name"
                  name="workspaceName"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t("workspace.newPlaceholder", "Restaurant name")}
                  autoFocus
                  className="mb-4 w-full rounded-lg border border-cream-3 bg-glass-bg px-3 py-2.5 text-[15.5px] text-text-primary outline-none transition-all focus:border-coffee focus:ring-1 focus:ring-coffee/20"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false);
                      setNewName("");
                    }}
                    className="cursor-pointer rounded-lg border border-cream-3 bg-transparent px-4 py-2 text-[15px] font-medium text-text-secondary transition-colors hover:bg-cream-3"
                  >
                    {t("common.cancel", "Cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={createWs.isPending || !newName.trim()}
                    className="cursor-pointer rounded-lg border-none bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-colors hover:bg-coffee-light disabled:opacity-50"
                  >
                    {createWs.isPending ? t("common.loading", "Loading...") : t("common.create", "Create")}
                  </button>
                </div>
              </form>
            </div>

            <Dialog.Close className="absolute right-3 top-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-text-tertiary transition-all hover:bg-cream-3/40 hover:text-text-secondary">
              <X size={15} />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
