"use client";

import { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { toast } from "sonner";
import { CustomDatePicker } from "@/components/shared/CustomDatePicker";
import { useCreateClosure, useUpdateClosure, type ClosureInput } from "@/hooks/useClosures";
import type { ClosurePeriod } from "@/types/closure";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

const schema = z
  .object({
    name: z.string().trim().min(1, "Required"),
    startDate: z.string().regex(DATE, "Pick a date"),
    endDate: z.string().regex(DATE, "Pick a date"),
  })
  .refine((v) => v.startDate <= v.endDate, {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });

type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = { name: "", startDate: "", endDate: "" };

const inputClass =
  "w-full rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 text-[15.5px] text-text-primary outline-none transition-colors focus:border-coffee focus:ring-1 focus:ring-coffee/20";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  closure?: ClosurePeriod | null;
}

export function ClosureFormModal({ open, onOpenChange, workspaceId, closure }: Props) {
  const isEdit = !!closure;
  const createClosure = useCreateClosure(workspaceId);
  const updateClosure = useUpdateClosure(workspaceId);

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
      closure
        ? { name: closure.name, startDate: closure.startDate, endDate: closure.endDate }
        : EMPTY,
    );
  }, [open, closure, reset]);

  const onSubmit = (values: FormValues) => {
    const payload: ClosureInput = values;
    const onError = () => toast.error(`Could not ${isEdit ? "update" : "create"} closure`);

    if (isEdit && closure) {
      updateClosure.mutate(
        { publicId: closure.publicId, ...payload },
        {
          onSuccess: () => {
            toast.success("Closure updated");
            onOpenChange(false);
          },
          onError,
        },
      );
    } else {
      createClosure.mutate(payload, {
        onSuccess: () => {
          toast.success("Closure created");
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
              {isEdit ? "Edit closure" : "New closure"}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-text-secondary">
              Attendance is not expected on closure days.
            </Dialog.Description>

            <div className="mt-5 space-y-3">
              <div>
                <label htmlFor="name" className="mb-1 block text-[13px] font-medium text-text-secondary">
                  Name
                </label>
                <input id="name" className={inputClass} placeholder="Public holiday" {...register("name")} />
                {errors.name && <p className="mt-1 text-[12.5px] text-red">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="startDate"
                    className="mb-1 block text-[13px] font-medium text-text-secondary"
                  >
                    From
                  </label>
                  <Controller
                    control={control}
                    name="startDate"
                    render={({ field }) => (
                      <CustomDatePicker id="startDate" value={field.value} onChange={field.onChange} />
                    )}
                  />
                </div>
                <div>
                  <label
                    htmlFor="endDate"
                    className="mb-1 block text-[13px] font-medium text-text-secondary"
                  >
                    To
                  </label>
                  <Controller
                    control={control}
                    name="endDate"
                    render={({ field }) => (
                      <CustomDatePicker id="endDate" value={field.value} onChange={field.onChange} />
                    )}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-[12.5px] text-red">{errors.endDate.message}</p>
                  )}
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
                {isEdit ? "Save changes" : "Create closure"}
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
