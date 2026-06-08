import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Lock, Unlock } from "lucide-react";
import { ActivationFeeForm } from "./ActivationFeeForm";

interface ActivationFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userActivationStatus: "inactive" | "active" | "suspended";
  userRegistrationStatus: "pending" | "approved" | "rejected";
}

export function ActivationFeeModal({
  isOpen,
  onClose,
  userActivationStatus,
  userRegistrationStatus,
}: ActivationFeeModalProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const isInactive = userActivationStatus === "inactive";
  const isApproved = userRegistrationStatus === "approved";

  if (!isInactive || !isApproved) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {showPaymentForm ? (
              <Unlock className="h-5 w-5 text-green-600" />
            ) : (
              <Lock className="h-5 w-5 text-blue-600" />
            )}
            <DialogTitle>
              {showPaymentForm
                ? "Activate Your Account"
                : "Account Inactive"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {showPaymentForm
              ? "Submit your M-Pesa payment code to activate your account and unlock all dropshipping features."
              : "Pay the activation fee to unlock all dropshipping features and start earning."}
          </DialogDescription>
        </DialogHeader>

        {!showPaymentForm ? (
          <div className="space-y-6">
            {/* Inactive Account Notice */}
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-semibold text-blue-900">
                    Please pay the activation fee of KSH 500
                  </p>
                  <p className="text-sm text-blue-800">
                    Your account is currently inactive. Pay the activation fee via M-Pesa to unlock all dropshipping features, including shipment tracking, pickup requests, and withdrawals.
                  </p>
                </div>
              </div>
            </div>

            {/* Features Locked */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700">
                Locked Features:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gray-400" />
                  <span>Shipment Tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gray-400" />
                  <span>Pickup Requests</span>
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gray-400" />
                  <span>Withdrawal Requests</span>
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gray-400" />
                  <span>Profit Tracking</span>
                </li>
              </ul>
            </div>

            {/* Payment Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Activation Fee:</span>
                <span className="font-semibold text-gray-900">KSH 500</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-semibold text-gray-900">M-Pesa</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Till Number:</span>
                <span className="font-semibold text-gray-900">5762195</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Browse Dashboard
              </Button>
              <Button
                onClick={() => setShowPaymentForm(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Pay Activation Fee
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setShowPaymentForm(false)}
              className="w-full mb-2"
            >
              Back
            </Button>
            <ActivationFeeForm
              onSuccess={() => {
                setShowPaymentForm(false);
                onClose();
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
