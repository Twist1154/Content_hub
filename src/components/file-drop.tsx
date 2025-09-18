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
  emailTo: z.string().email("Invalid email address.").min(1, "Recipient's email is required."),
  emailFrom: z.string().email("Invalid email address.").min(1, "Your email is required."),
  message: z.string().optional(),
  expiry: z.enum(["1d", "7d", "30d"]).default("7d"),
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
      message: "",
      expiry: "7d",
    },
  });

  const handleFiles = (selectedFiles: FileList | null) => {
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles);
      const uniqueNewFiles = newFiles.filter(
        (newFile) => !files.some((existingFile) => existingFile.name === newFile.name && existingFile.size === newFile.size)
      );
      setFiles((prevFiles) => [...prevFiles, ...uniqueNewFiles]);
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
  };

  const removeFile = (fileName: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };
  
  const clearFiles = () => {
    setFiles([]);
    setUploadProgress({});
    setUploadStatus("idle");
    form.reset();
  }

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

  if (uploadStatus === "success") {
    return (
      <Card className="w-full">
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
    return (
      <Card className="w-full">
        <CardContent className="p-8">
            <div className="text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <h2 className="mt-4 text-2xl font-bold">Transferring...</h2>
                <p className="mt-2 text-muted-foreground">Please keep this window open.</p>
            </div>
            <div className="mt-6 space-y-4">
                {files.map((file) => (
                    <div key={file.name} className="space-y-1">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <p className="truncate max-w-[70%]">{file.name}</p>
                            <p>{formatBytes(file.size)}</p>
                        </div>
                        <Progress value={uploadProgress[file.name] || 0} />
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>
    );
  }


  if (files.length > 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 md:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your Files</h2>
                <Button variant="ghost" size="sm" onClick={clearFiles}>Clear all</Button>
            </div>
          <div className="max-h-48 overflow-y-auto pr-2 space-y-2 mb-6">
            {files.map((file) => (
              <div key={file.name} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <FileIcon fileType={file.type} className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFile(file.name)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="emailTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email to</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="recipient@example.com" {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emailFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="you@example.com" {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea placeholder="Add a message..." {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expires in</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Select expiry" />
                          </SelectTrigger>
                        </div>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1d">1 Day</SelectItem>
                        <SelectItem value="7d">1 Week</SelectItem>
                        <SelectItem value="30d">1 Month</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
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
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "relative w-full h-80 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-colors duration-300",
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
      <div className="flex flex-col items-center justify-center p-6 text-muted-foreground">
        <UploadCloud className={cn("h-16 w-16 mb-4 transition-transform duration-300", isDragging && "scale-110 text-primary")} />
        <p className="text-2xl font-semibold">Drag & Drop your files here</p>
        <p className="mt-2">or</p>
        <Button asChild className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
            <label htmlFor="file-upload">Select Files</label>
        </Button>
        <p className="text-xs mt-4">Maximum file size: 2GB</p>
      </div>
    </div>
  );
}
