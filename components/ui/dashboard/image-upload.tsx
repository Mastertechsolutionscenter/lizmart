"use client";

import { CldUploadWidget } from "next-cloudinary";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { LuImagePlus as ImagePlus, LuTrash2 as Trash } from "react-icons/lu";

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (values: string[]) => void; // array of urls
  onRemove: (value: string) => void;
  value: string[]; // array of urls
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  // Local state to safely accumulate multiple incoming uploads
  const [localUrls, setLocalUrls] = useState<string[]>(value ?? []);

  // keep local state in sync if parent updates value (edit form load, etc.)
  useEffect(() => {
    setLocalUrls(value ?? []);
  }, [value]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Called by the Cloudinary widget for each upload result
  const onUpload = (result: any) => {
    // result shape can vary; handle common cases
    const info = result?.info ?? result;
    if (!info) return;

    const newUrls: string[] = [];

    // single-file
    if (typeof info.secure_url === "string") newUrls.push(info.secure_url);

    // sometimes widget may expose an array (secure_urls or similar)
    if (Array.isArray(info.secure_urls)) newUrls.push(...info.secure_urls);

    // defensive: some wrappers return result.info.url
    if (typeof info.url === "string" && !newUrls.includes(info.url))
      newUrls.push(info.url);

    if (newUrls.length === 0) return;

    // functional update to avoid race conditions when multiple onUpload callbacks fire quickly
    setLocalUrls((prev) => {
      const merged = [...prev, ...newUrls];
      // remove duplicates (optional)
      const unique = Array.from(new Set(merged));
      onChange(unique); // send full updated list to parent
      return unique;
    });
  };

  const handleRemove = (url: string) => {
    setLocalUrls((prev) => {
      const next = prev.filter((u) => u !== url);
      onChange(next);
      return next;
    });

    // call parent's onRemove as well (you already pass this in)
    onRemove(url);
  };

  if (!isMounted) return null;

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        {localUrls.map((url) => (
          <div
            key={url}
            className="relative w-[200px] h-[200px] rounded-md overflow-hidden"
          >
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={() => handleRemove(url)}
                variant="destructive"
                size="sm"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <Image fill className="object-cover" alt="Image" src={url} />
          </div>
        ))}
      </div>

      <CldUploadWidget
        onSuccess={onUpload}
        uploadPreset="my_widget_preset"
        options={{
          multiple: true,
          maxFiles: 10,
          // you can add other options here like folder, sources, etc.
        }}
      >
        {({ open }) => {
          return (
            <Button
              type="button"
              disabled={disabled}
              variant="secondary"
              onClick={() => open()}
            >
              <ImagePlus className="h-4 w-4 mr-2" />
              Upload Images
            </Button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
};

export default ImageUpload;
