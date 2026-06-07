import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock, TrendingUp, Truck, Wallet } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { ActivationFeeForm } from "@/components/ActivationFeeForm";
import { WithdrawalForm } from "@/components/WithdrawalForm";
import { PickupRequestForm } from "@/components/PickupRequestForm";

export default function UserDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"overview" | "shipments" | "activation" | "withdrawal">("overview");

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

        {isActivationInactive && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Account Inactive:</strong> Please pay the activation fee of KSH 500 to access dropshipping features.
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

        {/* Activation Fee Notice */}
        {isActivationInactive && (
          <Card className="mb-8 border-2 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Activation Fee Required
              </CardTitle>
              <CardDescription>Complete your account activation to start dropshipping</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-orange-200">
                <p className="text-sm text-slate-600 mb-2">
                  <strong>Activation Fee:</strong> KSH 500
                </p>
                <p className="text-sm text-slate-600">
                  <strong>Payment Method:</strong> M-Pesa Till 5762195
                </p>
              </div>
              <p className="text-sm text-slate-700">
                After paying via M-Pesa, submit your transaction code below. Our admin team will verify and activate your account.
              </p>
              <ActivationFeeForm onSuccess={() => activationQuery.refetch()} />
            </CardContent>
          </Card>
        )}

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

        {/* Tab Navigation */}
        {isActivationActive && (
          <div className="flex gap-2 mt-8 border-t border-slate-200 pt-6">
            <Button
              variant={activeTab === "overview" ? "default" : "outline"}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </Button>
            <Button
              variant={activeTab === "shipments" ? "default" : "outline"}
              onClick={() => setActiveTab("shipments")}
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
            >
              Withdrawals
            </Button>
          </div>
        )}
      </div>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/message/AXBZCPUEDZJKE1?src=qr"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
      >
        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.766-5.764-5.766zm3.392 8.221c-.142.399-.715.763-1.141.817-.425.054-.858.074-1.282-.047-.273-.078-.544-.188-.793-.327-1.459-.815-2.415-2.301-2.488-2.4-.073-.1-.62-.824-.62-1.572 0-.748.391-1.116.533-1.265.142-.149.31-.186.412-.186s.205.003.295.007c.096.004.223-.036.35.269.13.313.444 1.082.483 1.161.04.08.066.173.013.28-.053.107-.08.173-.16.267-.08.093-.169.207-.242.277-.08.077-.163.16-.07.32.093.16.411.68.882 1.1 1.031.919 1.452.951 1.612 1.011.16.06.253.053.347-.053.093-.107.4-.467.507-.627.107-.16.213-.133.36-.08.147.053.933.44 1.093.52.16.08.267.12.307.186.039.066.039.386-.104.785z" />
        </svg>
      </a>
    </div>
  );
}
