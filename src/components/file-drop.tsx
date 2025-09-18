"use client";

import { ChangeEvent, useCallback, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  UploadCloud,
  Mail,
  MessageSquare,
  Clock,
  Copy,
  Lock,
  CheckCircle,
  Trash2,
  Send,
  Loader2,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn, formatBytes } from "@/lib/utils";
import { generateLinkAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import FileIcon from "./file-icon";

const formSchema = z.object({
  emailTo: z.string().email("Invalid email address.").optional(),
  emailFrom: z.string().email("Invalid email address.").optional(),
  title: z.string().min(1, "Title is required."),
  message: z.string().optional(),
});

type UploadStatus = "idle" | "uploading" | "success" | "error";

export function FileDrop() {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [fileName: string]: number }>({});
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [shareableLink, setShareableLink] = useState<string | null>(null);
  const [isPasswordProtected, setIsPasswordProtected] = useState<boolean | null>(null);
  const [isPending, startTransition] = useTransition();

  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailTo: "",
      emailFrom: "",
      title: "",
      message: "",
    },
  });

  const handleFiles = (selectedFiles: FileList | null) => {
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles);
      const uniqueNewFiles = newFiles.filter(
        (newFile) => !files.some((existingFile) => existingFile.name === newFile.name && existingFile.size === newFile.size)
      );
      setFiles((prevFiles) => [...prevFiles, ...uniqueNewFiles]);
      if(uniqueNewFiles.length > 0 && !form.getValues('title')) {
        form.setValue('title', uniqueNewFiles.map(f => f.name).join(', '));
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // This is necessary to allow dropping
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // reset input to allow selecting the same file again
    e.target.value = '';
  };

  const removeFile = (fileName: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  const simulateUpload = (file: File): Promise<void> => {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          const currentProgress = newProgress[file.name] || 0;
          const nextProgress = Math.min(currentProgress + 10, 100);
          newProgress[file.name] = nextProgress;

          if (nextProgress === 100) {
            clearInterval(interval);
            resolve();
          }

          return newProgress;
        });
      }, 100);
    });
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to transfer.",
        variant: "destructive",
      });
      return;
    }

    setUploadStatus("uploading");

    startTransition(async () => {
      try {
        await Promise.all(files.map(simulateUpload));

        const firstFileType = files[0]?.type.split('/')[1] || 'unknown';
        const fileNames = files.map((f) => f.name);

        const result = await generateLinkAction({ fileType: firstFileType, fileNames });

        setShareableLink(result.shareableLink);
        setIsPasswordProtected(result.isPasswordProtected);
        setUploadStatus("success");
      } catch (error) {
        setUploadStatus("error");
        toast({
          title: "Upload Failed",
          description: "Something went wrong while generating the link. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const copyLink = () => {
    if (shareableLink) {
      navigator.clipboard.writeText(shareableLink);
      toast({
        title: "Link Copied!",
        description: "The shareable link has been copied to your clipboard.",
      });
    }
  };

  const reset = () => {
    setFiles([]);
    setUploadProgress({});
    setUploadStatus("idle");
    setShareableLink(null);
    setIsPasswordProtected(null);
    form.reset();
  };
  
  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  if (uploadStatus === "success") {
    return (
      <Card className="w-full bg-background/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-4 text-2xl font-bold">Transfer complete!</h2>
          <p className="mt-2 text-muted-foreground">Your files are ready to be shared.</p>
          <div className="mt-6 flex items-center rounded-lg border bg-secondary p-4">
            <input
              type="text"
              readOnly
              value={shareableLink || ""}
              className="flex-1 bg-transparent text-sm text-secondary-foreground outline-none"
            />
            {isPasswordProtected && <Lock className="mx-2 h-4 w-4 text-muted-foreground" title="Password protected" />}
            <Button size="sm" onClick={copyLink}><Copy className="mr-2 h-4 w-4" />Copy link</Button>
          </div>
          <Button variant="outline" className="mt-8 w-full" onClick={reset}>
            Send another file
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (uploadStatus === "uploading") {
    const overallProgress = files.length > 0 ? files.reduce((acc, file) => acc + (uploadProgress[file.name] || 0), 0) / files.length : 0;
    return (
      <Card className="w-full bg-background/80 backdrop-blur-sm">
        <CardContent className="p-8">
            <div className="text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <h2 className="mt-4 text-2xl font-bold">Transferring...</h2>
                <p className="mt-2 text-muted-foreground">
                  {files.length} {files.length === 1 ? 'file' : 'files'} • {formatBytes(totalSize)}
                </p>
            </div>
            <div className="mt-6 space-y-1">
                <Progress value={overallProgress} />
                <p className="text-center text-sm text-muted-foreground">{Math.round(overallProgress)}%</p>
            </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card 
        className="w-full bg-background/80 backdrop-blur-sm"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
    >
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className={cn("flex gap-4", files.length > 0 && "items-start")}>
                <div
                    className={cn(
                        "relative w-28 h-28 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center transition-colors duration-300 shrink-0",
                        isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/30 hover:border-primary"
                    )}
                    >
                    <input
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="file-upload"
                    />
                    {files.length > 0 ? (
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <PlusCircle className="h-8 w-8 mb-1" />
                          <span className="text-sm font-medium">Add more</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-2 text-muted-foreground">
                          <UploadCloud className="h-8 w-8 mb-1" />
                          <p className="text-sm font-semibold">Upload files</p>
                      </div>
                    )}
                </div>

                {files.length > 0 && (
                    <div className="flex-grow min-w-0">
                        <div className="max-h-28 overflow-y-auto pr-2 space-y-2">
                        {files.map((file) => (
                        <div key={file.name} className="flex items-center justify-between rounded-lg border p-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <FileIcon fileType={file.type} className="h-5 w-5 text-muted-foreground shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeFile(file.name)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        ))}
                    </div>
                  </div>
                )}
            </div>
            
            <p className="text-xs text-muted-foreground">
              {files.length > 0 ? `${files.length} ${files.length === 1 ? 'file' : 'files'}, ${formatBytes(totalSize)}` : 'You can upload up to 2GB.'}
            </p>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Descriptive title for your files" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add a message..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-2">
                <Button type="submit" disabled={isPending || files.length === 0} className="w-full">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Transfer
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
