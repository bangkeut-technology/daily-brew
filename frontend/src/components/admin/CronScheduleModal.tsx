"use client";

import { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { toast } from "sonner";
import { CustomSelect } from "@/components/shared/CustomSelect";
import {
  useAdminCronJobs,
  useCreateAdminCronSchedule,
  useUpdateAdminCronSchedule,
} from "@/hooks/useAdminCron";
import type { ScheduledCommand } from "@/types/admin-cron";

const schema = z.object({
  command: z.string().min(1, "Pick a command"),
  name: z.string().trim().min(1, "Required"),
  cronExpression: z.string().trim().min(1, "e.g. 0 18 * * *"),
  arguments: z.string().optional(),
  priority: z.number().int(),
});

type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = { command: "", name: "", cronExpression: "", arguments: "", priority: 0 };

const inputClass =
  "w-full rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 text-[15px] text-text-primary outline-none transition-colors focus:border-coffee focus:ring-1 focus:ring-coffee/20";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule?: ScheduledCommand | null;
}

export function CronScheduleModal({ open, onOpenChange, schedule }: Props) {
  const isEdit = !!schedule;
  const { data: jobs } = useAdminCronJobs();
  const create = useCreateAdminCronSchedule();
  const update = useUpdateAdminCronSchedule();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    reset(
      schedule
        ? {
            command: schedule.command,
            name: schedule.name,
            cronExpression: schedule.cronExpression,
            arguments: schedule.arguments ?? "",
            priority: schedule.priority,
          }
        : EMPTY,
    );
  }, [open, schedule, reset]);

  const onSubmit = (values: FormValues) => {
    const payload = { ...values, arguments: values.arguments || undefined };
    const onError = () => toast.error(`Could not ${isEdit ? "update" : "create"} schedule`);
    if (isEdit && schedule) {
      update.mutate(
        { id: schedule.id, ...payload },
        { onSuccess: () => { toast.success("Schedule updated"); onOpenChange(false); }, onError },
      );
    } else {
      create.mutate(payload, {
        onSuccess: () => { toast.success("Schedule created"); onOpenChange(false); },
        onError,
      });
    }
  };

  const jobOptions = (jobs ?? []).map((j) => ({ value: j.command, label: j.label }));

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content
          // CustomSelect portals its menu to document.body (outside Dialog.Content's
          // DOM tree). Radix interprets a click on that menu as an outside interaction
          // and dismisses the dialog; the dismissal's onClose clobbers the option
          // click's state update in the same React batch. Net effect: dropdown closes,
          // no value selected. Mirrors the legacy SPA fix.
          onInteractOutside={(e) => e.preventDefault()}
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-glass-border bg-glass-bg shadow-[0_16px_50px_rgba(107,66,38,0.15)] outline-none backdrop-blur-xl"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <Dialog.Title className="font-serif text-[20px] font-semibold text-text-primary">
              {isEdit ? "Edit schedule" : "New schedule"}
            </Dialog.Title>

            <div className="mt-5 space-y-3">
              <div>
                <label htmlFor="command" className="mb-1 block text-[13px] font-medium text-text-secondary">
                  Command
                </label>
                <Controller
                  control={control}
                  name="command"
                  render={({ field }) => (
                    <CustomSelect
                      id="command"
                      value={field.value}
                      onChange={(cmd) => {
                        field.onChange(cmd);
                        const job = jobs?.find((j) => j.command === cmd);
                        if (job) {
                          setValue("name", job.label);
                          setValue("cronExpression", job.suggestedCron);
                        }
                      }}
                      options={jobOptions}
                      placeholder="Pick a command"
                    />
                  )}
                />
                {errors.command && <p className="mt-1 text-[12.5px] text-red">{errors.command.message}</p>}
              </div>
              <div>
                <label htmlFor="name" className="mb-1 block text-[13px] font-medium text-text-secondary">Name</label>
                <input id="name" className={inputClass} {...register("name")} />
                {errors.name && <p className="mt-1 text-[12.5px] text-red">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="cronExpression" className="mb-1 block text-[13px] font-medium text-text-secondary">Cron</label>
                  <input id="cronExpression" className={`${inputClass} font-mono`} placeholder="0 18 * * *" {...register("cronExpression")} />
                  {errors.cronExpression && <p className="mt-1 text-[12.5px] text-red">{errors.cronExpression.message}</p>}
                </div>
                <div>
                  <label htmlFor="priority" className="mb-1 block text-[13px] font-medium text-text-secondary">Priority</label>
                  <input id="priority" type="number" className={inputClass} {...register("priority", { valueAsNumber: true })} />
                </div>
              </div>
              <div>
                <label htmlFor="arguments" className="mb-1 block text-[13px] font-medium text-text-secondary">Arguments</label>
                <input id="arguments" className={`${inputClass} font-mono`} placeholder="--option=value" {...register("arguments")} />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => onOpenChange(false)} className="cursor-pointer rounded-lg border border-cream-3 px-4 py-2 text-[15px] font-medium text-text-secondary transition-colors hover:bg-cream-3">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="cursor-pointer rounded-lg bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-colors hover:bg-coffee-light disabled:opacity-50">{isEdit ? "Save" : "Create"}</button>
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
