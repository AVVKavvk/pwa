import { useState, useEffect } from "react";
import {
  Wifi,
  WifiOff,
  Download,
  Bell,
  RefreshCw,
  CheckCircle,
  Smartphone,
} from "lucide-react";

export default function PWATestApp() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installPromptCaptured, setInstallPromptCaptured] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(
    Notification.permission
  );
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    // Online/Offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Install prompt capture
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setInstallPromptCaptured(true);
      addTestResult("✅ Install prompt captured! You can now install the app.");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      addTestResult("ℹ️ App is running in standalone mode (installed)");
    } else {
      addTestResult("ℹ️ App is running in browser mode");
    }

    // Service Worker registration - wait for production build
    if ("serviceWorker" in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register("/sw.js").then(
        (registration) => {
          addTestResult("✅ Service Worker registered successfully");

          // Check for updates
          registration.addEventListener("updatefound", () => {
            setUpdateAvailable(true);
            addTestResult("🔄 Update available");
          });
        },
        (error) => {
          addTestResult("❌ Service Worker registration failed: " + error);
        }
      );
    } else if (import.meta.env.DEV) {
      addTestResult(
        "ℹ️ Service Worker only works in production build. Run: npm run build && npm run preview"
      );
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const addTestResult = (message: string) => {
    setTestResults((prev) => [message, ...prev].slice(0, 10));
  };

  const handleInstall = async () => {
    if (isInstalled) {
      addTestResult("ℹ️ App is already installed in standalone mode");
      return;
    }

    if (!installPrompt) {
      addTestResult(
        "⚠️ Install prompt not available yet. This can happen because:"
      );
      addTestResult(
        "  1. You need to build for production: npm run build && npm run preview"
      );
      addTestResult(
        "  2. PWA must be served over HTTPS (works on Render deployment)"
      );
      addTestResult("  3. Browser may have already shown the prompt before");
      addTestResult(
        "  4. Some browsers (Firefox, Safari) don't support install prompt"
      );
      addTestResult('💡 On mobile: Use browser menu → "Add to Home Screen"');
      return;
    }

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === "accepted") {
      addTestResult("✅ App installed successfully!");
      setIsInstalled(true);
    } else {
      addTestResult("❌ Installation cancelled by user");
    }

    setInstallPrompt(null);
    setInstallPromptCaptured(false);
  };

  const testNotifications = async () => {
    if (!("Notification" in window)) {
      addTestResult("❌ Notifications not supported");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === "granted") {
      new Notification("PWA Test", {
        body: "Notifications are working! 🎉",
        icon: "/pwa-192x192.png",
        badge: "/pwa-192x192.png",
      });
      addTestResult("✅ Notification sent successfully");
    } else {
      addTestResult("❌ Notification permission denied");
    }
  };

  const testOfflineMode = () => {
    addTestResult(`📡 Current status: ${isOnline ? "Online" : "Offline"}`);
    addTestResult("💡 Try turning off your internet to test offline mode");
  };

  const testCaching = async () => {
    try {
      const cache = await caches.open("test-cache");
      await cache.add(window.location.href);
      addTestResult("✅ Page cached successfully");

      const keys = await cache.keys();
      addTestResult(`📦 Cache contains ${keys.length} items`);
    } catch (error) {
      addTestResult("❌ Caching failed: " + error);
    }
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              PWA Test App
            </h1>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="text-green-500" size={24} />
              ) : (
                <WifiOff className="text-red-500" size={24} />
              )}
            </div>
          </div>
          <p className="text-gray-600">
            Test your Progressive Web App features
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Smartphone size={20} className="text-blue-500" />
              <span className="text-sm font-semibold text-gray-700">
                Installation
              </span>
            </div>
            <p
              className={`text-lg font-bold ${
                isInstalled ? "text-green-600" : "text-orange-600"
              }`}
            >
              {isInstalled ? "Installed ✓" : "Not Installed"}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Bell size={20} className="text-purple-500" />
              <span className="text-sm font-semibold text-gray-700">
                Notifications
              </span>
            </div>
            <p
              className={`text-lg font-bold ${
                notificationPermission === "granted"
                  ? "text-green-600"
                  : notificationPermission === "denied"
                  ? "text-red-600"
                  : "text-orange-600"
              }`}
            >
              {notificationPermission === "granted"
                ? "Enabled ✓"
                : notificationPermission === "denied"
                ? "Denied ✗"
                : "Not Set"}
            </p>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle className="text-blue-600" />
            Test Features
          </h2>

          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={handleInstall}
              className={`flex items-center justify-center gap-2 ${
                installPromptCaptured
                  ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 animate-pulse"
                  : isInstalled
                  ? "bg-gradient-to-r from-gray-400 to-gray-500"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              } text-white py-3 px-6 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg`}
            >
              <Download size={20} />
              {isInstalled
                ? "Already Installed"
                : installPromptCaptured
                ? "🎉 Ready to Install!"
                : "Install App"}
            </button>

            <button
              onClick={testNotifications}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              <Bell size={20} />
              Test Notifications
            </button>

            <button
              onClick={testOfflineMode}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
            >
              {isOnline ? <Wifi size={20} /> : <WifiOff size={20} />}
              Test Offline Mode
            </button>

            <button
              onClick={testCaching}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg"
            >
              <RefreshCw size={20} />
              Test Caching
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Test Results</h2>
            <button
              onClick={clearTestResults}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Click the buttons above to test PWA features
              </p>
            ) : (
              testResults.map((result, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 border border-gray-200"
                >
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Update Banner */}
        {updateAvailable && (
          <div className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto bg-yellow-500 text-white p-4 rounded-lg shadow-lg flex items-center justify-between">
            <span className="font-semibold">New version available!</span>
            <button
              onClick={() => window.location.reload()}
              className="bg-white text-yellow-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Update Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
