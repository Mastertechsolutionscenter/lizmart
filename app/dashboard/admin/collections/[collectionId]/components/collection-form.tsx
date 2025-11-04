"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as z from "zod";

import { Collection, CollectionProduct, Product } from "@/generated/prisma";
import { createCollectionSchema } from "@/schemas/collection";

interface CollectionFormProps {
  initialData: (Collection & {
    products: (CollectionProduct & {
      product: Pick<Product, "id" | "title">;
    })[];
  }) | null;
}

import { Button } from "@/components/ui/button";
import { AlertModal } from "@/components/ui/dashboard/alert-modal";
import { Heading } from "@/components/ui/dashboard/heading";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { LuTrash2 as Trash } from "react-icons/lu";

export type CollectionFormValues = z.infer<typeof createCollectionSchema>;

interface CollectionFormProps {
  initialData: (Collection & {
    products: (CollectionProduct & {
      product: Pick<Product, "id" | "title">;
    })[];
  }) | null;
  allCollections: { id: string; title: string }[];
}

export const CollectionForm: React.FC<CollectionFormProps> = ({
  initialData, allCollections,
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit collection" : "Create collection";
  const description = initialData
    ? "Update collection details"
    : "Add a new collection";
  const toastMessage = initialData ? "Collection updated." : "Collection created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<CollectionFormValues>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: initialData
      ? {
          handle: initialData.handle,
          title: initialData.title,
          description: initialData.description ?? "",
          seoId: initialData.seoId ?? undefined,
          parentId: (initialData as any).parentId ?? null,
        }
      : {
          handle: "",
          title: "",
          description: "",
          seoId: undefined,
          parentId: null,
        },
  });

  const onSubmit = async (data: CollectionFormValues) => {
    try {
      setLoading(true);

      if (initialData) {
        await axios.patch(`/api/admin/collections/${params.collectionId}`, data);
      } else {
        await axios.post(`/api/admin/collections`, data);
      }

      router.refresh();
      router.push(`/dashboard/admin/collections`);
      toast.success(toastMessage);
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/admin/collections/${params.collectionId}`);
      router.push(`/dashboard/admin/collections`);
      toast.success("Collection deleted.");
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="grid md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Collection name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="handle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Handle</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="collection-handle"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
  control={form.control}
  name="parentId"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Parent Collection</FormLabel>
      <FormControl>
        <select
          disabled={loading}
          value={field.value || ""}
          onChange={(e) =>
            field.onChange(e.target.value === "" ? null : e.target.value)
          }
          className="border border-input rounded-md px-3 py-2 w-full"
        >
          <option value="">No parent (Top-level)</option>
          {allCollections
            .filter((c) => !initialData || c.id !== initialData.id)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
        </select>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={loading}
                    placeholder="Describe this collection"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
