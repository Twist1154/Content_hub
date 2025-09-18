
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { ClientHeader } from '@/components/client/ClientHeader';
import { fetchStoresByUserId, fetchContentStatsByUserId, fetchClientProfileById } from '@/app/actions/data-actions';
import { DashboardClient } from '@/components/client/DashboardClient';

// --- Page Component ---

export default async function Dashboard(
  props: {
    searchParams: { [key: string]: string | string[] | undefined };
  }
) {
  const searchParams = props.searchParams;
  const user = await getCurrentUser();
  if (!user || !user.profile) redirect('/auth/client/signin');

  const adminViewParam = searchParams.admin_view;
  const adminViewClientId = typeof adminViewParam === 'string' ? adminViewParam : undefined;
  const isAdminView = !!(user.profile?.role === 'admin' && adminViewClientId);

  // Determine the ID of the user whose data we need to fetch
  const targetUserId = isAdminView ? adminViewClientId : user.id;

  let viewingClient = user;

  // Use a single try...catch block for all data fetching for this page
  try {
    // If it's an admin view, we first need to fetch the client's profile for the header
    if (isAdminView) {
      const profileResult = await fetchClientProfileById(adminViewClientId);
      if (!profileResult.success || !profileResult.profile) {
        // If the client profile doesn't exist, it's a 404
        return notFound();
      }
      viewingClient = { ...user, profile: profileResult.profile };
    }

    // Fetch stores and content stats in parallel for the target user
    const [storesResult, contentStatsResult] = await Promise.all([
      fetchStoresByUserId(targetUserId),
      fetchContentStatsByUserId(targetUserId),
    ]);

    // If either of these critical fetches fail, we can't render the dashboard
    if (!storesResult.success || !contentStatsResult.success) {
      console.error("Critical dashboard data failed to load:", storesResult.error || contentStatsResult.error);
      throw new Error("Could not load dashboard data.");
    }

    const stores = storesResult.stores || [];
    const contentStats = contentStatsResult.stats || { total: 0, active: 0, scheduled: 0, thisMonth: 0 };

    return (
      <div className="min-h-screen bg-background">
        <ClientHeader
          user={user}
          isAdminView={isAdminView}
          viewingClientProfile={viewingClient.profile}
        />
        <DashboardClient
            userId={targetUserId}
            isAdminView={isAdminView}
            initialStores={stores}
            contentStats={contentStats}
        />
      </div>
    );

  } catch (error) {
    console.error("Dashboard page render failed:", error);
    // If any part of the data fetching process throws an error, show the not found page.
    return notFound();
  }
}
