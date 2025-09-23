
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
      className="w-full bg-background/80 backdrop-blur-sm"
      {...dragHandlers}
    >
      <CardContent className="p-6">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className={cn("flex gap-4", files.length > 0 && "items-start")}>
              <div
                className={cn(
                  "relative w-28 h-28 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center transition-colors duration-300 shrink-0",
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
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              {files.length > 0
                ? `${files.length} ${
                    files.length === 1 ? "file" : "files"
                  }, ${formatBytes(totalSize)}`
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
      </CardContent>
    </Card>
  );
}
