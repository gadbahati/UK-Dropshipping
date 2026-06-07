import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users to their appropriate dashboard
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if (user.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    }
  }, [loading, isAuthenticated, user, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      {/* Navigation */}
      <nav className="h-20 bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-600">Globalpack</h1>
              <p className="text-xs text-slate-500">🇬🇧 UK Logistics</p>
            </div>
          </div>
          <Button
            onClick={() => setLocation(getLoginUrl())}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
            🇬🇧 UK-Based Logistics
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Make your 1st 1000 dollars.
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Scale your dropshipping business with the most reliable logistics partner in the United Kingdom.
          </p>
          <Button
            onClick={() => setLocation(getLoginUrl())}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            Start Your Journey
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white border-t border-slate-200 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-slate-900 mb-12">
            How Globalpack Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="text-xl font-semibold text-slate-900 mb-2">Select & Pay</h4>
              <p className="text-slate-600">
                Choose your plan and pay via M-Pesa Till 5762195.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="text-xl font-semibold text-slate-900 mb-2">Verify</h4>
              <p className="text-slate-600">
                Submit your code for instant activation by our team.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="text-xl font-semibold text-slate-900 mb-2">Earn</h4>
              <p className="text-slate-600">
                Track your shipments and withdraw your profits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            <details className="border border-slate-200 rounded-lg p-4 bg-white cursor-pointer group">
              <summary className="font-semibold text-slate-900 flex justify-between items-center">
                How long does shipping take?
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-slate-600 mt-3">
                Most shipments from our UK warehouse reach their destination within 4-7 business days.
              </p>
            </details>
            <details className="border border-slate-200 rounded-lg p-4 bg-white cursor-pointer group">
              <summary className="font-semibold text-slate-900 flex justify-between items-center">
                Is my money safe?
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-slate-600 mt-3">
                Yes, Globalpack is a verified UK-registered logistics entity. All payments are tracked via M-Pesa transaction codes.
              </p>
            </details>
            <details className="border border-slate-200 rounded-lg p-4 bg-white cursor-pointer group">
              <summary className="font-semibold text-slate-900 flex justify-between items-center">
                How do I withdraw?
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-slate-600 mt-3">
                Once your shipment is marked as delivered, you can request a withdrawal to your registered M-Pesa number.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-slate-50 py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8 text-sm font-semibold text-slate-600">
            <div>🔒 SSL SECURED</div>
            <div>✓ VERIFIED UK LOGISTICS</div>
            <div>📱 SAFARICOM INTEGRATED</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-600">
          <p>&copy; 2026 Globalpack Shipping. All rights reserved.</p>
        </div>
      </footer>

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
