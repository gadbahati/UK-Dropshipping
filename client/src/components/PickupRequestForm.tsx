import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface PickupRequestFormProps {
  onSuccess?: () => void;
}

export function PickupRequestForm({ onSuccess }: PickupRequestFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const requestPickup = trpc.pickups.requestPickup.useMutation({
    onSuccess: () => {
      toast.success("Pickup request submitted. Awaiting admin approval.");
      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        onSuccess?.();
      }, 2000);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit pickup request");
    },
  });

  const handleSubmit = () => {
    requestPickup.mutate();
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        Request Pickup
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Pickup</DialogTitle>
            <DialogDescription>
              Submit a pickup request to collect your items from our warehouse
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle2 className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Pickup Request Submitted
              </h3>
              <p className="text-center text-slate-600">
                Your pickup request has been submitted. Our admin team will review and schedule your pickup. You'll receive a confirmation with the pickup date and location.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>Pickup Process:</strong><br />
                  1. Submit your pickup request<br />
                  2. Wait for admin approval<br />
                  3. Receive pickup date and location<br />
                  4. Collect your items from our UK warehouse
                </AlertDescription>
              </Alert>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-700">
                  <strong>Important:</strong> Pickup requests are processed during business hours (Monday - Friday, 9 AM - 5 PM GMT). Your request will be reviewed by our admin team and you'll receive confirmation within 24 hours.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={requestPickup.isPending}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={requestPickup.isPending}
                  onClick={handleSubmit}
                >
                  {requestPickup.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
