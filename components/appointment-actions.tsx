import { checkRole } from "@/utils/roles";
import { auth } from "@clerk/nextjs/server";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { EllipsisVertical, User } from "lucide-react";
import Link from "next/link";
import { AppointmentActionDialog } from "./appointment-action-dialog";

interface ActionsProps {
  userId?: string | null;
  status: string;
  patientId: string;
  doctorId: string;
  appointmentId: number;
}

export async function AppointmentActionOptions ({
  userId,
  patientId,
  doctorId,
  status,
  appointmentId,
}: ActionsProps) {
  const user = await auth();
  const isAdmin = await checkRole("ADMIN");
  const currentUserId = userId ?? user.userId;

  return (
    <Popover>
      <PopoverTrigger>
        <Button
          variant="outline"
          className="flex items-center justify-center rounded-full p-1"
        >
          <EllipsisVertical size={16} className="text-sm text-gray-500" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-56 p-3">
        <div className="space-y-3 flex flex-col items-start">
          <span className="text-gray-400 text-xs">Perform Actions</span>
          <Button
            size="sm"
            variant="ghost"
            className="w-full justify-start"
          >
            <Link href={`appointments/${appointmentId}`}>
              <User size={16} /> View Full Details
            </Link>
          </Button>

          {status !== "SCHEDULED" && (
            <AppointmentActionDialog
              type="approve"
              id={appointmentId}
              disabled={isAdmin || currentUserId === doctorId}
            />
          )}
          <AppointmentActionDialog
            type="cancel"
            id={appointmentId}
            disabled={
              status === "PENDING" &&
              (isAdmin || currentUserId === doctorId || currentUserId === patientId)
            }
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};
