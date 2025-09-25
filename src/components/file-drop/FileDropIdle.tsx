
"use client";

import type { ChangeEvent } from "react";
import { useForm, FormProvider } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import {
  UploadCloud,
  Trash2,
  Send,
  Loader2,
  PlusCircle,
  FileText,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Card, CardContent } from "@/components/ui/Card";
import { cn, formatBytes } from "@/lib/utils";
import FileIcon from "../FileIcon";
import { Logo } from "@/components/Logo";

const formSchema = z.object({
  emailTo: z.string().email("Invalid email address.").optional(),
  emailFrom: z.string().email("Invalid email address.").optional(),
  title: z.string().min(1, "Title is required."),
  message: z.string().optional(),
});

type FileDropIdleProps = {
  files: File[];
  isDragging: boolean;
  isPending: boolean;
  form: UseFormReturn<z.infer<typeof formSchema>>;
  handleFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  removeFile: (fileName: string) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  handleDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
};

export function FileDropIdle({
  files,
  isDragging,
  isPending,
  form,
  handleFileSelect,
  removeFile,
  onSubmit,
  ...dragHandlers
}: FileDropIdleProps) {
    
  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  return (
    <Card
      className="w-full max-w-4xl bg-background/80 backdrop-blur-sm"
      {...dragHandlers}
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-8 bg-muted/50 rounded-l-lg border-r">
          <div className="flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Logo className="h-10 w-10 text-primary" />
                <span className="text-2xl font-bold text-foreground">
                  HapoHub Transfer
                </span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Send files securely
              </h2>
              <p className="mt-3 text-muted-foreground">
                Transfer your files with confidence. Your transfers are private
                and protected from start to finish.
              </p>
            </div>

            <div className="mt-8 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Up to 2GB</h4>
                  <p className="text-muted-foreground">
                    Send files of any type, up to 2GB per transfer.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    Secure & Private
                  </h4>
                  <p className="text-muted-foreground">
                    Links are password-protected for sensitive content.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div
                className={cn(
                  "relative w-full h-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center transition-colors duration-300",
                  isDragging
                    ? "border-primary bg-primary/10"
                    : "border-muted-foreground/30 hover:border-primary"
                )}
              >
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="file-upload"
                />
                <div className="flex flex-col items-center justify-center p-2 text-muted-foreground">
                  <UploadCloud className="h-8 w-8 mb-2" />
                  <p className="text-sm font-semibold">
                    {files.length > 0 ? "Add more files or " : ""}
                    Drag & drop
                  </p>
                  <p className="text-xs">or click to browse</p>
                </div>
              </div>

              {files.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {files.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center justify-between rounded-lg border p-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileIcon
                          fileType={file.type}
                          className="h-5 w-5 text-muted-foreground shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatBytes(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => removeFile(file.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground pt-1">
                {files.length > 0
                  ? `${files.length} ${
                      files.length === 1 ? "file" : "files"
                    } selected, ${formatBytes(totalSize)} total.`
                  : "You can upload up to 2GB."}
              </p>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Descriptive title for your files"
                        {...field}
                      />
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
                <Button
                  type="submit"
                  disabled={isPending || files.length === 0}
                  className="w-full"
                >
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
          </FormProvider>
        </div>
      </div>
    </Card>
  );
}
