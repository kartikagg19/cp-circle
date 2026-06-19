"use client";

import { useState, useCallback } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

interface ImageUploaderProps {
  images: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({ images, onChange, maxImages = 10 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      if (images.length + files.length > maxImages) {
        toast.error(`Max ${maxImages} images allowed`);
        return;
      }

      setUploading(true);
      const uploaded: string[] = [];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const formData = new FormData();
        formData.append("file", file);

        try {
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          const data = await res.json();
          if (data.url) uploaded.push(data.url);
        } catch {
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      onChange([...images, ...uploaded]);
      setUploading(false);
    },
    [images, maxImages, onChange]
  );

  function removeImage(url: string) {
    onChange(images.filter((img) => img !== url));
  }

  return (
    <div className="space-y-3">
      {/* Upload zone */}
      <label
        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploading ? "border-gray-300 bg-gray-50" : "border-orange-300 hover:border-orange-500 bg-orange-50 hover:bg-orange-100"}`}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />
        {uploading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Uploading...
          </div>
        ) : (
          <div className="flex flex-col items-center text-orange-600">
            <Upload className="h-6 w-6 mb-1" />
            <span className="text-sm font-medium">Click to upload photos</span>
            <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB each • Max {maxImages} photos</span>
          </div>
        )}
      </label>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((url, idx) => (
            <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
              <Image src={url} alt={`Photo ${idx + 1}`} fill className="object-cover" sizes="120px" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
              {idx === 0 && (
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
