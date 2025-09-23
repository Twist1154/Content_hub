
"use client";

import { ChangeEvent, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { generateLinkAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";

// Import the new state components
import { FileDropIdle } from "./file-drop/FileDropIdle";
import { FileDropUploading } from "./file-drop/FileDropUploading";
import { FileDropSuccess } from "./file-drop/FileDropSuccess";

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
  const [uploadProgress, setUploadProgress] = useState<{
    [fileName: string]: number;
  }>({});
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [shareableLink, setShareableLink] = useState<string | null>(null);
  const [isPasswordProtected, setIsPasswordProtected] = useState<
    boolean | null
  >(null);
  const [isPending, startTransition] = useTransition();

  const supabase = createClient();
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
        (newFile) =>
          !files.some(
            (existingFile) =>
              existingFile.name === newFile.name &&
              existingFile.size === newFile.size
          )
      );
      setFiles((prevFiles) => [...prevFiles, ...uniqueNewFiles]);
      if (uniqueNewFiles.length > 0 && !form.getValues("title")) {
        form.setValue("title", uniqueNewFiles.map((f) => f.name).join(", "));
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
    e.preventDefault();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = "";
  };

  const removeFile = (fileName: string) => {
    setFiles((prevFiles) =>
      prevFiles.filter((file) => file.name !== fileName)
    );
  };

  const uploadFile = async (file: File): Promise<string> => {
    const filePath = `public/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("files")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      throw error;
    }
    return filePath;
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
        const uploadPaths = await Promise.all(files.map(uploadFile));
        setUploadProgress(
          files.reduce((acc, file) => ({ ...acc, [file.name]: 100 }), {})
        );

        const firstFileType = files[0]?.type.split("/")[1] || "unknown";
        const fileNames = files.map((f) => f.name);

        const result = await generateLinkAction({
          fileType: firstFileType,
          fileNames,
          uploadPaths,
        });

        setShareableLink(result.shareableLink);
        setIsPasswordProtected(result.isPasswordProtected);
        setUploadStatus("success");
      } catch (error: any) {
        setUploadStatus("error");
        toast({
          title: "Upload Failed",
          description:
            error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    });
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
      <FileDropSuccess
        shareableLink={shareableLink}
        isPasswordProtected={isPasswordProtected}
        reset={reset}
      />
    );
  }

  if (uploadStatus === "uploading") {
    return (
      <FileDropUploading files={files} uploadProgress={uploadProgress} />
    );
  }

  return (
    <FileDropIdle
      files={files}
      isDragging={isDragging}
      isPending={isPending}
      form={form}
      handleFileSelect={handleFileSelect}
      removeFile={removeFile}
      onSubmit={onSubmit}
      handleDragEnter={handleDragEnter}
      handleDragLeave={handleDragLeave}
      handleDragOver={handleDragOver}
      handleDrop={handleDrop}
    />
  );
}
