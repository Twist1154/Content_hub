
"use client";

import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/lib/utils";

type FileDropUploadingProps = {
  files: File[];
  uploadProgress: { [fileName: string]: number };
};

export function FileDropUploading({
  files,
  uploadProgress,
}: FileDropUploadingProps) {
  const overallProgress =
    files.length > 0
      ? files.reduce(
          (acc, file) => acc + (uploadProgress[file.name] || 0),
          0
        ) / files.length
      : 0;

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  return (
    <Card className="w-full bg-background/80 backdrop-blur-sm">
      <CardContent className="p-8">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <h2 className="mt-4 text-2xl font-bold">Transferring...</h2>
          <p className="mt-2 text-muted-foreground">
            {files.length} {files.length === 1 ? "file" : "files"} •{" "}
            {formatBytes(totalSize)}
          </p>
        </div>
        <div className="mt-6 space-y-1">
          <Progress value={overallProgress} />
          <p className="text-center text-sm text-muted-foreground">
            {Math.round(overallProgress)}%
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
