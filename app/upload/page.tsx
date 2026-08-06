
"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function UploadResume() {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log(acceptedFiles);
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`rounded-3xl border-2 border-dashed p-12 text-center transition-all duration-300 cursor-pointer

      ${
        isDragActive
          ? "border-blue-500 bg-blue-500/10"
          : "border-border hover:border-blue-500"
      }`}
    >
      <input {...getInputProps()} />

      <h2 className="text-2xl font-bold">
        Drop your Resume here
      </h2>

      <p className="mt-3 text-muted-foreground">
        or click to browse
      </p>
    </div>
  );
}