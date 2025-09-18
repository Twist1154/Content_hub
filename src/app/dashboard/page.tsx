import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/actions/auth-actions";
import { FileDrop } from "@/components/file-drop";

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/auth/client/signin');
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen pt-20">
            <div className="w-full max-w-lg mx-auto p-4 md:max-w-2xl">
              <FileDrop />
            </div>
            <div className="absolute bottom-4">
              <p className="text-sm text-muted-foreground">Logged in as {user.email}</p>
              <form action={signOut} className="text-center mt-2">
                  <Button type="submit" variant="ghost" size="sm">Sign Out</Button>
              </form>
            </div>
        </div>
    );
}
