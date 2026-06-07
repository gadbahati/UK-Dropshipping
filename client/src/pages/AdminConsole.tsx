import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminConsole() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"users" | "activations" | "pickups" | "withdrawals">("users");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const usersQuery = trpc.users.getAll.useQuery();
  const activationsQuery = trpc.activation.getAllRequests.useQuery();
  const pickupsQuery = trpc.pickups.getAllRequests.useQuery();
  const withdrawalsQuery = trpc.withdrawals.getAllRequests.useQuery();

  // Mutations
  const updateRegistrationStatus = trpc.users.updateRegistrationStatus.useMutation({
    onSuccess: () => {
      toast.success("Registration status updated");
      usersQuery.refetch();
    },
  });

  const updateActivationStatus = trpc.users.updateActivationStatus.useMutation({
    onSuccess: () => {
      toast.success("Activation status updated");
      usersQuery.refetch();
    },
  });

  const updatePickupStatus = trpc.users.updatePickupStatus.useMutation({
    onSuccess: () => {
      toast.success("Pickup status updated");
      usersQuery.refetch();
    },
  });

  const approveActivation = trpc.activation.approveRequest.useMutation({
    onSuccess: () => {
      toast.success("Activation request approved");
      activationsQuery.refetch();
      usersQuery.refetch();
    },
  });

  const rejectActivation = trpc.activation.rejectRequest.useMutation({
    onSuccess: () => {
      toast.success("Activation request rejected");
      activationsQuery.refetch();
    },
  });

  const approvePickup = trpc.pickups.approveRequest.useMutation({
    onSuccess: () => {
      toast.success("Pickup request approved");
      pickupsQuery.refetch();
    },
  });

  const completePickup = trpc.pickups.completePickup.useMutation({
    onSuccess: () => {
      toast.success("Pickup marked as completed");
      pickupsQuery.refetch();
    },
  });

  const approveWithdrawal = trpc.withdrawals.approveRequest.useMutation({
    onSuccess: () => {
      toast.success("Withdrawal request approved");
      withdrawalsQuery.refetch();
    },
  });

  const completeWithdrawal = trpc.withdrawals.completeWithdrawal.useMutation({
    onSuccess: () => {
      toast.success("Withdrawal marked as completed");
      withdrawalsQuery.refetch();
    },
  });

  if (authLoading || usersQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          <p className="mt-4 text-slate-300">Loading admin console...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-red-400">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">You do not have permission to access the admin console.</p>
            <Button onClick={() => setLocation("/")} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusBadgeColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Users className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Console</h1>
              <p className="text-sm text-slate-400">Globalpack Management</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setLocation("/")} className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-slate-700 pb-4">
          <Button
            variant={activeTab === "users" ? "default" : "outline"}
            onClick={() => setActiveTab("users")}
            className={activeTab === "users" ? "bg-blue-600" : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"}
          >
            Users ({usersQuery.data?.length || 0})
          </Button>
          <Button
            variant={activeTab === "activations" ? "default" : "outline"}
            onClick={() => setActiveTab("activations")}
            className={activeTab === "activations" ? "bg-blue-600" : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"}
          >
            Activations ({activationsQuery.data?.length || 0})
          </Button>
          <Button
            variant={activeTab === "pickups" ? "default" : "outline"}
            onClick={() => setActiveTab("pickups")}
            className={activeTab === "pickups" ? "bg-blue-600" : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"}
          >
            Pickups ({pickupsQuery.data?.length || 0})
          </Button>
          <Button
            variant={activeTab === "withdrawals" ? "default" : "outline"}
            onClick={() => setActiveTab("withdrawals")}
            className={activeTab === "withdrawals" ? "bg-blue-600" : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"}
          >
            Withdrawals ({withdrawalsQuery.data?.length || 0})
          </Button>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">User Directory</CardTitle>
                <CardDescription className="text-slate-400">Manage user registrations and statuses</CardDescription>
              </CardHeader>
              <CardContent>
                {usersQuery.data && usersQuery.data.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {usersQuery.data.map(u => (
                      <div key={u.id} className="p-4 border border-slate-700 rounded-lg bg-slate-700">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="font-medium text-white">{u.name || u.email}</p>
                            <p className="text-sm text-slate-400">{u.email}</p>
                          </div>
                          <Badge className="ml-2">{u.role}</Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                          <div>
                            <p className="text-slate-400">Registration</p>
                            <Badge className={statusBadgeColor(u.registrationStatus)}>
                              {u.registrationStatus}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-slate-400">Activation</p>
                            <Badge className={statusBadgeColor(u.activationStatus)}>
                              {u.activationStatus}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-slate-400">Pickup</p>
                            <Badge className={statusBadgeColor(u.pickupStatus)}>
                              {u.pickupStatus.replace(/_/g, " ")}
                            </Badge>
                          </div>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              className="w-full bg-blue-600 hover:bg-blue-700"
                              onClick={() => setSelectedUser(u)}
                            >
                              Manage User
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-slate-800 border-slate-700">
                            <DialogHeader>
                              <DialogTitle className="text-white">Manage User: {selectedUser?.name || selectedUser?.email}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label className="text-slate-300">Registration Status</Label>
                                <div className="flex gap-2 mt-2">
                                  <Button
                                    size="sm"
                                    onClick={() => updateRegistrationStatus.mutate({ userId: selectedUser.id, status: "approved" })}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => updateRegistrationStatus.mutate({ userId: selectedUser.id, status: "rejected" })}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Reject
                                  </Button>
                                </div>
                              </div>

                              <div>
                                <Label className="text-slate-300">Activation Status</Label>
                                <div className="flex gap-2 mt-2">
                                  <Button
                                    size="sm"
                                    onClick={() => updateActivationStatus.mutate({ userId: selectedUser.id, status: "active" })}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Activate
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => updateActivationStatus.mutate({ userId: selectedUser.id, status: "inactive" })}
                                    className="bg-yellow-600 hover:bg-yellow-700"
                                  >
                                    Deactivate
                                  </Button>
                                </div>
                              </div>

                              <div>
                                <Label className="text-slate-300">Pickup Status</Label>
                                <div className="flex gap-2 mt-2">
                                  <Button
                                    size="sm"
                                    onClick={() => updatePickupStatus.mutate({ userId: selectedUser.id, status: "approved_for_pickup" })}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Approve Pickup
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => updatePickupStatus.mutate({ userId: selectedUser.id, status: "pickup_completed" })}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    Mark Completed
                                  </Button>
                                </div>
                              </div>

                              <div>
                                <Label htmlFor="admin-notes" className="text-slate-300">Admin Notes</Label>
                                <Textarea
                                  id="admin-notes"
                                  placeholder="Add notes about this user..."
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  className="bg-slate-700 border-slate-600 text-white mt-2"
                                />
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No users found</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Activations Tab */}
        {activeTab === "activations" && (
          <div className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Activation Requests</CardTitle>
                <CardDescription className="text-slate-400">Review and approve M-Pesa payment codes</CardDescription>
              </CardHeader>
              <CardContent>
                {activationsQuery.data && activationsQuery.data.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {activationsQuery.data.map(req => (
                      <div key={req.id} className="p-4 border border-slate-700 rounded-lg bg-slate-700">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium text-white">Transaction: {req.mpesaTransactionCode}</p>
                            <p className="text-sm text-slate-400">Amount: KSH {req.amount}</p>
                          </div>
                          <Badge className={statusBadgeColor(req.status)}>{req.status}</Badge>
                        </div>

                        {req.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => approveActivation.mutate({ requestId: req.id })}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => rejectActivation.mutate({ requestId: req.id })}
                              className="flex-1 bg-red-600 hover:bg-red-700"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No activation requests</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pickups Tab */}
        {activeTab === "pickups" && (
          <div className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Pickup Requests</CardTitle>
                <CardDescription className="text-slate-400">Manage user pickup requests</CardDescription>
              </CardHeader>
              <CardContent>
                {pickupsQuery.data && pickupsQuery.data.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {pickupsQuery.data.map(req => (
                      <div key={req.id} className="p-4 border border-slate-700 rounded-lg bg-slate-700">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium text-white">Pickup Request #{req.id}</p>
                            <p className="text-sm text-slate-400">Created: {new Date(req.createdAt).toLocaleDateString()}</p>
                          </div>
                          <Badge className={statusBadgeColor(req.status)}>{req.status}</Badge>
                        </div>

                        {req.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => approvePickup.mutate({ requestId: req.id })}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                          </div>
                        )}

                        {req.status === "approved" && (
                          <Button
                            size="sm"
                            onClick={() => completePickup.mutate({ requestId: req.id })}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            Mark Completed
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No pickup requests</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Withdrawals Tab */}
        {activeTab === "withdrawals" && (
          <div className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Withdrawal Requests</CardTitle>
                <CardDescription className="text-slate-400">Approve and process user withdrawals</CardDescription>
              </CardHeader>
              <CardContent>
                {withdrawalsQuery.data && withdrawalsQuery.data.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {withdrawalsQuery.data.map(req => (
                      <div key={req.id} className="p-4 border border-slate-700 rounded-lg bg-slate-700">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium text-white">KSH {req.amount}</p>
                            <p className="text-sm text-slate-400">To: {req.mpesaNumber}</p>
                          </div>
                          <Badge className={statusBadgeColor(req.status)}>{req.status}</Badge>
                        </div>

                        {req.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => approveWithdrawal.mutate({ requestId: req.id })}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                          </div>
                        )}

                        {req.status === "approved" && (
                          <Button
                            size="sm"
                            onClick={() => completeWithdrawal.mutate({ requestId: req.id })}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            Mark Completed
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No withdrawal requests</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
