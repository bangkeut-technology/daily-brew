"use client";

import { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { toast } from "sonner";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { CustomDatePicker } from "@/components/shared/CustomDatePicker";
import { useCreateEmployee, useUpdateEmployee, type EmployeeInput } from "@/hooks/useEmployees";
import { useShifts } from "@/hooks/useShifts";
import type { Employee } from "@/types/employee";

const schema = z.object({
  firstName: z.string().trim().min(1, "Required"),
  lastName: z.string().trim().min(1, "Required"),
  username: z.string().trim().optional(),
  phoneNumber: z.string().trim().optional(),
  jobTitle: z.string().trim().optional(),
  role: z.enum(["employee", "manager"]),
  attendanceTracking: z.enum(["full", "none"]),
  dob: z.string().optional(),
  joinedAt: z.string().optional(),
  shiftPublicId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = {
  firstName: "",
  lastName: "",
  username: "",
  phoneNumber: "",
  jobTitle: "",
  role: "employee",
  attendanceTracking: "full",
  dob: "",
  joinedAt: "",
  shiftPublicId: "",
};

const inputClass =
  "w-full rounded-lg border border-cream-3 bg-glass-bg px-3 py-2 text-[15.5px] text-text-primary outline-none transition-colors focus:border-coffee focus:ring-1 focus:ring-coffee/20";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  employee?: Employee | null;
}

export function EmployeeFormModal({ open, onOpenChange, workspaceId, employee }: Props) {
  const isEdit = !!employee;
  const createEmployee = useCreateEmployee(workspaceId);
  const updateEmployee = useUpdateEmployee(workspaceId);
  const { data: shifts } = useShifts(workspaceId);
  const shiftOptions = [
    { value: "", label: "No shift" },
    ...(shifts ?? []).map((s) => ({ value: s.publicId, label: s.name })),
  ];

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
      employee
        ? {
            firstName: employee.firstName,
            lastName: employee.lastName,
            username: employee.username ?? "",
            phoneNumber: employee.phoneNumber ?? "",
            jobTitle: employee.jobTitle ?? "",
            role: employee.role,
            attendanceTracking: employee.attendanceTracking,
            dob: employee.dob ?? "",
            joinedAt: employee.joinedAt ?? "",
            shiftPublicId: employee.shiftPublicId ?? "",
          }
        : EMPTY,
    );
  }, [open, employee, reset]);

  const onSubmit = (values: FormValues) => {
    const payload: EmployeeInput = {
      firstName: values.firstName,
      lastName: values.lastName,
      username: values.username || null,
      phoneNumber: values.phoneNumber || null,
      jobTitle: values.jobTitle || null,
      role: values.role,
      attendanceTracking: values.attendanceTracking,
      dob: values.dob || null,
      joinedAt: values.joinedAt || null,
      shiftPublicId: values.shiftPublicId || null,
    };

    const onError = () => toast.error(`Could not ${isEdit ? "update" : "add"} employee`);

    if (isEdit && employee) {
      updateEmployee.mutate(
        { publicId: employee.publicId, ...payload },
        {
          onSuccess: () => {
            toast.success("Employee updated");
            onOpenChange(false);
          },
          onError,
        },
      );
    } else {
      createEmployee.mutate(payload, {
        onSuccess: () => {
          toast.success("Employee added");
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
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-glass-border bg-glass-bg shadow-[0_16px_50px_rgba(107,66,38,0.15)] outline-none backdrop-blur-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <Dialog.Title className="font-serif text-[20px] font-semibold text-text-primary">
              {isEdit ? "Edit employee" : "Add employee"}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-text-secondary">
              {isEdit ? "Update this employee's details." : "Add a new member to your team."}
            </Dialog.Description>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Field label="First name" htmlFor="firstName" error={errors.firstName?.message}>
                <input id="firstName" className={inputClass} {...register("firstName")} />
              </Field>
              <Field label="Last name" htmlFor="lastName" error={errors.lastName?.message}>
                <input id="lastName" className={inputClass} {...register("lastName")} />
              </Field>
              <Field label="Job title" htmlFor="jobTitle">
                <input id="jobTitle" className={inputClass} {...register("jobTitle")} />
              </Field>
              <Field label="Phone" htmlFor="phoneNumber">
                <input id="phoneNumber" className={inputClass} {...register("phoneNumber")} />
              </Field>
              <Field label="Username" htmlFor="username">
                <input id="username" className={inputClass} {...register("username")} />
              </Field>
              <Field label="Role" htmlFor="role">
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <CustomSelect
                      id="role"
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        { value: "employee", label: "Employee" },
                        { value: "manager", label: "Manager" },
                      ]}
                    />
                  )}
                />
              </Field>
              <Field label="Attendance tracking" htmlFor="attendanceTracking">
                <Controller
                  control={control}
                  name="attendanceTracking"
                  render={({ field }) => (
                    <CustomSelect
                      id="attendanceTracking"
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        { value: "full", label: "Tracked" },
                        { value: "none", label: "Not tracked" },
                      ]}
                    />
                  )}
                />
              </Field>
              <Field label="Shift" htmlFor="shiftPublicId">
                <Controller
                  control={control}
                  name="shiftPublicId"
                  render={({ field }) => (
                    <CustomSelect
                      id="shiftPublicId"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      options={shiftOptions}
                    />
                  )}
                />
              </Field>
              <Field label="Date of birth" htmlFor="dob">
                <Controller
                  control={control}
                  name="dob"
                  render={({ field }) => (
                    <CustomDatePicker id="dob" value={field.value ?? ""} onChange={field.onChange} />
                  )}
                />
              </Field>
              <Field label="Joined" htmlFor="joinedAt">
                <Controller
                  control={control}
                  name="joinedAt"
                  render={({ field }) => (
                    <CustomDatePicker id="joinedAt" value={field.value ?? ""} onChange={field.onChange} />
                  )}
                />
              </Field>
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
                {isEdit ? "Save changes" : "Add employee"}
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

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-[13px] font-medium text-text-secondary">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-[12.5px] text-red">{error}</p>}
    </div>
  );
}
