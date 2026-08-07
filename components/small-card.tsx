import { cn } from "@/lib/utils";

export function SmallCard ({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number | null | undefined;
  className?: string;
}) {
  return (
    <div className="w-full  md:w-1/3">
      <span className="text-sm text-gray-500">{label}</span>
      <p className={cn("text-sm md:text-base", className)}>{value ?? "—"}</p>
    </div>
  );
};
