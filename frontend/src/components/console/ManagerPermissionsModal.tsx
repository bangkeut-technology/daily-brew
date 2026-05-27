"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Toggle } from "@/components/shared/Toggle";
import { useUpdateManagerPermissions } from "@/hooks/useEmployees";
import type { Employee } from "@/types/employee";
import type { ManagerPermission } from "@/types/auth";

const PERMISSIONS: { value: ManagerPermission; label: string; description: string }[] = [
  { value: "manage_employees", label: "Employees", description: "Add, edit, and remove staff" },
  { value: "manage_shifts", label: "Shifts", description: "Create and assign shifts" },
  { value: "manage_closures", label: "Closures", description: "Manage closure periods" },
  { value: "manage_leave", label: "Leave", description: "Approve and reject leave requests" },
  { value: "manage_attendance", label: "Attendance", description: "See all attendance and edit records" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  employee: Employee | null;
}

export function ManagerPermissionsModal({ open, onOpenChange, workspaceId, employee }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-glass-border bg-glass-bg shadow-[0_16px_50px_rgba(107,66,38,0.15)] outline-none backdrop-blur-xl">
          {open && employee && (
            <PermissionsForm
              key={employee.publicId}
              employee={employee}
              workspaceId={workspaceId}
              onDone={() => onOpenChange(false)}
            />
          )}
          <Dialog.Close className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary transition-all hover:bg-cream-3/40 hover:text-text-secondary">
            <X size={15} />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PermissionsForm({
  employee,
  workspaceId,
  onDone,
}: {
  employee: Employee;
  workspaceId: string;
  onDone: () => void;
}) {
  const update = useUpdateManagerPermissions(workspaceId);
  const [selected, setSelected] = useState<Set<ManagerPermission>>(
    () => new Set(employee.managerPermissions),
  );

  const toggle = (perm: ManagerPermission, on: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(perm);
      else next.delete(perm);
      return next;
    });
  };

  const save = () => {
    update.mutate(
      { publicId: employee.publicId, permissions: [...selected] },
      {
        onSuccess: () => {
          toast.success("Permissions updated");
          onDone();
        },
        onError: () => toast.error("Could not update permissions"),
      },
    );
  };

  return (
    <div className="p-6">
      <Dialog.Title className="font-serif text-[20px] font-semibold text-text-primary">
        Manager permissions
      </Dialog.Title>
      <Dialog.Description className="mt-1 text-sm text-text-secondary">
        What {employee.name} can manage in this workspace.
      </Dialog.Description>

      <div className="mt-5 divide-y divide-cream-3/70">
        {PERMISSIONS.map((perm) => (
          <div key={perm.value} className="flex items-center justify-between gap-4 py-3">
            <div>
              <p className="font-medium text-text-primary">{perm.label}</p>
              <p className="text-sm text-text-tertiary">{perm.description}</p>
            </div>
            <Toggle checked={selected.has(perm.value)} onChange={(on) => toggle(perm.value, on)} />
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onDone}
          className="cursor-pointer rounded-lg border border-cream-3 px-4 py-2 text-[15px] font-medium text-text-secondary transition-colors hover:bg-cream-3"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={update.isPending}
          className="cursor-pointer rounded-lg bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-colors hover:bg-coffee-light disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
}
