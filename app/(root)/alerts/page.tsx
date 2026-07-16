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
        <p className="mt-3 text-gray-400">
          Sign in to manage your price alerts.
        </p>
      </div>
    );
  }

  const alerts = await getUserAlerts();

  // Convert MongoDB/Mongoose objects into plain serializable objects
  const serializedAlerts = alerts.map((alert: any) => ({
    ...alert,
    _id: alert._id?.toString(),
    userId: alert.userId?.toString(),
    createdAt: alert.createdAt
      ? new Date(alert.createdAt).toISOString()
      : null,
    updatedAt: alert.updatedAt
      ? new Date(alert.updatedAt).toISOString()
      : undefined,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">
            Your Price Alerts
          </h1>

          <p className="mt-2 text-gray-400">
            {serializedAlerts.length > 0
              ? `You have ${serializedAlerts.length} active alert${
                  serializedAlerts.length === 1 ? "" : "s"
                }.`
              : "No alerts set. Add alerts from your watchlist."}
          </p>
        </div>
      </div>

      <AlertsList alerts={serializedAlerts} />
    </div>
  );
};

export default AlertsPage;