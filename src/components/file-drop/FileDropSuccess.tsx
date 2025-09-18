
"use client";

import { CheckCircle, Copy, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type FileDropSuccessProps = {
  shareableLink: string | null;
  isPasswordProtected: boolean | null;
  reset: () => void;
};

export function FileDropSuccess({
  shareableLink,
  isPasswordProtected,
  reset,
}: FileDropSuccessProps) {
  const { toast } = useToast();

  const copyLink = () => {
    if (shareableLink) {
      navigator.clipboard.writeText(shareableLink);
      toast({
        title: "Link Copied!",
        description: "The shareable link has been copied to your clipboard.",
      });
    }
  };

  return (
    <Card className="w-full bg-background/80 backdrop-blur-sm">
      <CardContent className="p-8 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h2 className="mt-4 text-2xl font-bold">Transfer complete!</h2>
        <p className="mt-2 text-muted-foreground">
          Your files are ready to be shared.
        </p>
        <div className="mt-6 flex items-center rounded-lg border bg-secondary p-4">
          <input
            type="text"
            readOnly
            value={shareableLink || ""}
            className="flex-1 bg-transparent text-sm text-secondary-foreground outline-none"
          />
          {isPasswordProtected && (
            <Lock
              className="mx-2 h-4 w-4 text-muted-foreground"
              title="Password protected"
            />
          )}
          <Button size="sm" onClick={copyLink}>
            <Copy className="mr-2 h-4 w-4" />
            Copy link
          </Button>
        </div>
        <Button variant="outline" className="mt-8 w-full" onClick={reset}>
          Send another file
        </Button>
      </CardContent>
    </Card>
  );
}
