import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { getUserAlerts } from "@/lib/actions/alert.actions";
import AlertsList from "@/components/AlertsList";

const AlertsPage = async () => {
  const session = await auth?.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <h1 className="text-2xl font-semibold text-white">Your Alerts</h1>
        <p className="mt-3 text-gray-400">Sign in to manage your price alerts.</p>
      </div>
    );
  }

  const alerts = await getUserAlerts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Your Price Alerts</h1>
          <p className="mt-2 text-gray-400">
            {alerts.length > 0
              ? `You have ${alerts.length} active alert${alerts.length === 1 ? "" : "s"}.`
              : "No alerts set. Add alerts from your watchlist."}
          </p>
        </div>
      </div>

      <AlertsList alerts={alerts} />
    </div>
  );
};

export default AlertsPage;