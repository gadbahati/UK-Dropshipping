import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ActivationFeeFormProps {
  onSuccess?: () => void;
}

export function ActivationFeeForm({ onSuccess }: ActivationFeeFormProps) {
  const [mpesaCode, setMpesaCode] = useState("");
  const [amount, setAmount] = useState("500");
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitPayment = trpc.activation.submitPaymentCode.useMutation({
    onSuccess: () => {
      toast.success("M-Pesa code submitted successfully. Awaiting admin approval.");
      setMpesaCode("");
      setAmount("500");
      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        onSuccess?.();
      }, 2000);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit M-Pesa code");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mpesaCode.trim()) {
      toast.error("Please enter your M-Pesa transaction code");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    submitPayment.mutate({
      mpesaCode: mpesaCode.trim(),
      amount,
    });
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        Submit M-Pesa Code
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Activation Fee Payment</DialogTitle>
            <DialogDescription>
              Enter your M-Pesa transaction details to activate your account
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle2 className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Payment Submitted
              </h3>
              <p className="text-center text-slate-600">
                Your M-Pesa code has been submitted. Our admin team will verify and activate your account shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>Step 1:</strong> Pay KSH 500 to M-Pesa Till 5762195<br />
                  <strong>Step 2:</strong> Enter your transaction code below<br />
                  <strong>Step 3:</strong> Wait for admin approval
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="mpesa-code" className="text-slate-700">
                  M-Pesa Transaction Code *
                </Label>
                <Input
                  id="mpesa-code"
                  placeholder="e.g., RH123ABC"
                  value={mpesaCode}
                  onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                  className="border-slate-300"
                  disabled={submitPayment.isPending}
                />
                <p className="text-xs text-slate-500">
                  You'll receive this code via SMS after paying via M-Pesa
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-slate-700">
                  Amount (KSH) *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border-slate-300"
                  disabled={submitPayment.isPending}
                  min="1"
                  step="0.01"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={submitPayment.isPending}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={submitPayment.isPending}
                >
                  {submitPayment.isPending ? "Submitting..." : "Submit Code"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
