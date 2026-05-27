"use client";

import { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { toast } from "sonner";
import { CustomTimePicker } from "@/components/shared/CustomTimePicker";
import { useCreateShift, useUpdateShift, type ShiftInput } from "@/hooks/useShifts";
import type { Shift } from "@/types/shift";

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

const schema = z.object({
  name: z.string().trim().min(1, "Required"),
  startTime: z.string().regex(TIME, "HH:MM"),
  endTime: z.string().regex(TIME, "HH:MM"),
});

type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = { name: "", startTime: "09:00", endTime: "17:00" };

const inputClass =
  "w-full rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 text-[15.5px] text-text-primary outline-none transition-colors focus:border-coffee focus:ring-1 focus:ring-coffee/20";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  shift?: Shift | null;
}

export function ShiftFormModal({ open, onOpenChange, workspaceId, shift }: Props) {
  const isEdit = !!shift;
  const createShift = useCreateShift(workspaceId);
  const updateShift = useUpdateShift(workspaceId);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    reset(
      shift
        ? { name: shift.name, startTime: shift.startTime, endTime: shift.endTime }
        : EMPTY,
    );
  }, [open, shift, reset]);

  const onSubmit = (values: FormValues) => {
    const payload: ShiftInput = values;
    const onError = () => toast.error(`Could not ${isEdit ? "update" : "create"} shift`);

    if (isEdit && shift) {
      updateShift.mutate(
        { publicId: shift.publicId, ...payload },
        {
          onSuccess: () => {
            toast.success("Shift updated");
            onOpenChange(false);
          },
          onError,
        },
      );
    } else {
      createShift.mutate(payload, {
        onSuccess: () => {
          toast.success("Shift created");
          onOpenChange(false);
        },
        onError,
      });
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-glass-border bg-glass-bg shadow-[0_16px_50px_rgba(107,66,38,0.15)] outline-none backdrop-blur-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <Dialog.Title className="font-serif text-[20px] font-semibold text-text-primary">
              {isEdit ? "Edit shift" : "New shift"}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-text-secondary">
              Staff are flagged late or left-early against this shift.
            </Dialog.Description>

            <div className="mt-5 space-y-3">
              <div>
                <label htmlFor="name" className="mb-1 block text-[13px] font-medium text-text-secondary">
                  Name
                </label>
                <input id="name" className={inputClass} placeholder="Morning" {...register("name")} />
                {errors.name && <p className="mt-1 text-[12.5px] text-red">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="startTime"
                    className="mb-1 block text-[13px] font-medium text-text-secondary"
                  >
                    Start
                  </label>
                  <Controller
                    control={control}
                    name="startTime"
                    render={({ field }) => (
                      <CustomTimePicker id="startTime" value={field.value} onChange={field.onChange} />
                    )}
                  />
                </div>
                <div>
                  <label
                    htmlFor="endTime"
                    className="mb-1 block text-[13px] font-medium text-text-secondary"
                  >
                    End
                  </label>
                  <Controller
                    control={control}
                    name="endTime"
                    render={({ field }) => (
                      <CustomTimePicker id="endTime" value={field.value} onChange={field.onChange} />
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer rounded-lg border border-cream-3 px-4 py-2 text-[15px] font-medium text-text-secondary transition-colors hover:bg-cream-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer rounded-lg bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-colors hover:bg-coffee-light disabled:opacity-50"
              >
                {isEdit ? "Save changes" : "Create shift"}
              </button>
            </div>
          </form>

          <Dialog.Close className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary transition-all hover:bg-cream-3/40 hover:text-text-secondary">
            <X size={15} />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
