import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface WithdrawalFormProps {
  availableBalance: string;
  onSuccess?: () => void;
}

export function WithdrawalForm({ availableBalance, onSuccess }: WithdrawalFormProps) {
  const [amount, setAmount] = useState("");
  const [mpesaNumber, setMpesaNumber] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const requestWithdrawal = trpc.withdrawals.requestWithdrawal.useMutation({
    onSuccess: () => {
      toast.success("Withdrawal request submitted. Awaiting admin approval.");
      setAmount("");
      setMpesaNumber("");
      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        onSuccess?.();
      }, 2000);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit withdrawal request");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) > parseFloat(availableBalance)) {
      toast.error("Withdrawal amount exceeds available balance");
      return;
    }

    if (!mpesaNumber.trim()) {
      toast.error("Please enter your M-Pesa number");
      return;
    }

    // Validate M-Pesa number format (basic validation)
    const mpesaRegex = /^(?:\+?254|0)?[17]\d{8}$/;
    if (!mpesaRegex.test(mpesaNumber.replace(/\s/g, ""))) {
      toast.error("Please enter a valid M-Pesa number");
      return;
    }

    requestWithdrawal.mutate({
      amount,
      mpesaNumber: mpesaNumber.replace(/\s/g, ""),
    });
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        Request Withdrawal
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Withdrawal</DialogTitle>
            <DialogDescription>
              Submit a withdrawal request to transfer your earnings to M-Pesa
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle2 className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Withdrawal Requested
              </h3>
              <p className="text-center text-slate-600">
                Your withdrawal request has been submitted. Our admin team will process it and transfer your funds to the provided M-Pesa number.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 text-sm">
                  Available Balance: <strong>KSH {availableBalance}</strong>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="withdrawal-amount" className="text-slate-700">
                  Amount (KSH) *
                </Label>
                <Input
                  id="withdrawal-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border-slate-300"
                  disabled={requestWithdrawal.isPending}
                  min="1"
                  step="0.01"
                />
                <p className="text-xs text-slate-500">
                  Maximum: KSH {availableBalance}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mpesa-number" className="text-slate-700">
                  M-Pesa Number *
                </Label>
                <Input
                  id="mpesa-number"
                  placeholder="e.g., 0712345678"
                  value={mpesaNumber}
                  onChange={(e) => setMpesaNumber(e.target.value)}
                  className="border-slate-300"
                  disabled={requestWithdrawal.isPending}
                />
                <p className="text-xs text-slate-500">
                  Enter your M-Pesa registered phone number
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={requestWithdrawal.isPending}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={requestWithdrawal.isPending}
                >
                  {requestWithdrawal.isPending ? "Submitting..." : "Request Withdrawal"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
