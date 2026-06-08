import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock, TrendingUp, Truck, Wallet } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { ActivationFeeForm } from "@/components/ActivationFeeForm";
import { WithdrawalForm } from "@/components/WithdrawalForm";
import { PickupRequestForm } from "@/components/PickupRequestForm";
import { ActivationFeeModal } from "@/components/ActivationFeeModal";

export default function UserDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"overview" | "shipments" | "activation" | "withdrawal">("overview");
  const [showActivationModal, setShowActivationModal] = useState(false);

  useEffect(() => {
    // Show modal on mount if user is inactive and approved
    if (user && user.activationStatus === "inactive" && user.registrationStatus === "approved") {
      setShowActivationModal(true);
    }
  }, [user]);

  const userQuery = trpc.users.getCurrent.useQuery();
  const shipmentQuery = trpc.shipments.getMyShipments.useQuery();
  const profitQuery = trpc.shipments.getMyTotalProfit.useQuery();
  const activationQuery = trpc.activation.getMyRequests.useQuery();
  const withdrawalQuery = trpc.withdrawals.getMyRequests.useQuery();

  if (authLoading || userQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const currentUser = userQuery.data;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">Unable to load user information.</p>
            <Button onClick={() => setLocation("/")} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isRegistrationPending = currentUser.registrationStatus === "pending";
  const isRegistrationRejected = currentUser.registrationStatus === "rejected";
  const isActivationInactive = currentUser.activationStatus === "inactive";
  const isActivationActive = currentUser.activationStatus === "active";

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
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <>
      <ActivationFeeModal
        isOpen={showActivationModal}
        onClose={() => setShowActivationModal(false)}
        userActivationStatus={currentUser.activationStatus}
        userRegistrationStatus={currentUser.registrationStatus}
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">G</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Globalpack</h1>
                <p className="text-sm text-slate-500">🇬🇧 UK Logistics</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">{currentUser.name || currentUser.email}</span>
              <Button variant="outline" size="sm" onClick={() => setLocation("/")}>
                Logout
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Status Alerts */}
          {isRegistrationPending && (
            <Alert className="mb-6 border-yellow-200 bg-yellow-50">
              <Clock className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Registration Pending:</strong> Your account is awaiting admin approval. You'll be notified once approved.
              </AlertDescription>
            </Alert>
          )}

          {isRegistrationRejected && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Registration Rejected:</strong> Your registration was not approved. Please contact support.
              </AlertDescription>
            </Alert>
          )}

          {/* Account Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Registration Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={statusBadgeColor(currentUser.registrationStatus)}>
                  {currentUser.registrationStatus.charAt(0).toUpperCase() + currentUser.registrationStatus.slice(1)}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Activation Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={statusBadgeColor(currentUser.activationStatus)}>
                  {currentUser.activationStatus.charAt(0).toUpperCase() + currentUser.activationStatus.slice(1)}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Pickup Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={statusBadgeColor(currentUser.pickupStatus)}>
                  {currentUser.pickupStatus.replace(/_/g, " ").charAt(0).toUpperCase() + currentUser.pickupStatus.replace(/_/g, " ").slice(1)}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <Button
              variant={activeTab === "overview" ? "default" : "outline"}
              onClick={() => setActiveTab("overview")}
              disabled={!isActivationActive && activeTab === "overview"}
            >
              Overview
            </Button>
            <Button
              variant={activeTab === "shipments" ? "default" : "outline"}
              onClick={() => setActiveTab("shipments")}
              disabled={!isActivationActive && activeTab === "shipments"}
            >
              Shipments
            </Button>
            <Button
              variant={activeTab === "activation" ? "default" : "outline"}
              onClick={() => setActiveTab("activation")}
            >
              Activation
            </Button>
            <Button
              variant={activeTab === "withdrawal" ? "default" : "outline"}
              onClick={() => setActiveTab("withdrawal")}
              disabled={!isActivationActive && activeTab === "withdrawal"}
            >
              Withdrawals
            </Button>
          </div>

          {/* Main Content Tabs */}
          <div className="space-y-6">
            {/* Overview Tab */}
            {activeTab === "overview" && isActivationActive && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Total Profit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      KSH {profitQuery.data?.totalProfit || "0"}
                    </div>
                    <p className="text-sm text-slate-500 mt-2">From completed shipments</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-blue-600" />
                      Active Shipments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      {shipmentQuery.data?.filter(s => s.status !== "delivered").length || 0}
                    </div>
                    <p className="text-sm text-slate-500 mt-2">In transit or pending</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Shipments Tab */}
            {activeTab === "shipments" && isActivationActive && (
              <Card>
                <CardHeader>
                  <CardTitle>Shipment Tracking</CardTitle>
                  <CardDescription>Track your shipments and earnings</CardDescription>
                </CardHeader>
                <CardContent>
                  {shipmentQuery.isLoading ? (
                    <p className="text-slate-500">Loading shipments...</p>
                  ) : shipmentQuery.data && shipmentQuery.data.length > 0 ? (
                    <div className="space-y-3">
                      {shipmentQuery.data.map(shipment => (
                        <div key={shipment.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                          <div>
                            <p className="font-medium text-slate-900">{shipment.trackingNumber}</p>
                            <p className="text-sm text-slate-500">{shipment.destination}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={statusBadgeColor(shipment.status)}>
                              {shipment.status.replace(/_/g, " ")}
                            </Badge>
                            <p className="text-sm font-semibold text-green-600 mt-1">KSH {shipment.profit}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500">No shipments yet</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Activation Tab */}
            {activeTab === "activation" && (
              <Card>
                <CardHeader>
                  <CardTitle>Activation Fee Payment</CardTitle>
                  <CardDescription>Submit your M-Pesa transaction code</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activationQuery.data && activationQuery.data.length > 0 ? (
                    <div className="space-y-3">
                      {activationQuery.data.map(request => (
                        <div key={request.id} className="p-3 border border-slate-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-900">{request.mpesaTransactionCode}</p>
                              <p className="text-sm text-slate-500">KSH {request.amount}</p>
                            </div>
                            <Badge className={statusBadgeColor(request.status)}>
                              {request.status}
                            </Badge>
                          </div>
                          {request.adminNotes && (
                            <p className="text-sm text-slate-600 mt-2">Admin: {request.adminNotes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500">No payment submissions yet</p>
                  )}
                  <ActivationFeeForm onSuccess={() => activationQuery.refetch()} />
                </CardContent>
              </Card>
            )}

            {/* Withdrawal Tab */}
            {activeTab === "withdrawal" && isActivationActive && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-blue-600" />
                    Withdrawal Requests
                  </CardTitle>
                  <CardDescription>Request to withdraw your earnings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {withdrawalQuery.data && withdrawalQuery.data.length > 0 ? (
                    <div className="space-y-3">
                      {withdrawalQuery.data.map(request => (
                        <div key={request.id} className="p-3 border border-slate-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-900">KSH {request.amount}</p>
                              <p className="text-sm text-slate-500">{request.mpesaNumber}</p>
                            </div>
                            <Badge className={statusBadgeColor(request.status)}>
                              {request.status}
                            </Badge>
                          </div>
                          {request.adminNotes && (
                            <p className="text-sm text-slate-600 mt-2">Admin: {request.adminNotes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500">No withdrawal requests yet</p>
                  )}
                  <WithdrawalForm availableBalance={profitQuery.data?.totalProfit || "0"} onSuccess={() => withdrawalQuery.refetch()} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/message/AXBZCPUEDZJKE1"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 z-40"
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.946 1.227l-.356.214-3.71-.973.992 3.63-.235.374a9.861 9.861 0 .001 15.902c1.476.88 3.198 1.35 5.043 1.35h.003c5.514 0 10.016-4.479 10.016-9.98 0-2.665-.981-5.163-2.766-7.144A9.953 9.953 0 0012.051 2.5z" />
        </svg>
      </a>
    </>
  );
}
