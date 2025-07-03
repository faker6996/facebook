"use client";

import { Phone, PhoneOff } from "lucide-react";
import Button from "../ui/Button";

interface Props {
  callerName: string;
  onAccept: () => void;
  onDecline: () => void;
}

export default function IncomingCallModal({ callerName, onAccept, onDecline }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-lg bg-card p-6 text-card-foreground shadow-lg">
        <p className="text-center text-lg">
          <span className="font-bold">{callerName}</span> đang gọi cho bạn...
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Button size="icon" variant="danger" className="h-14 w-14 rounded-full" onClick={onDecline}>
            <PhoneOff className="h-6 w-6" />
          </Button>
          <Button size="icon" variant="success" className="h-14 w-14 rounded-full" onClick={onAccept}>
            <Phone className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
