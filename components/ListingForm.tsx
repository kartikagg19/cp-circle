"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { MUMBAI_LOCALITIES } from "@/constants/mumbai-areas";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().optional(),
  type: z.enum(["SALE", "RENT"]),
  propertyType: z.enum(["RESIDENTIAL", "COMMERCIAL"]),
  bhk: z.coerce.number().min(1).max(10).optional(),
  price: z.coerce.number().min(1, "Price is required"),
  area_sqft: z.coerce.number().optional(),
  locality: z.string().min(1, "Locality is required"),
  subLocality: z.string().optional(),
  pincode: z.string().length(6, "Enter valid pincode"),
  furnishing: z.enum(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"]).optional(),
  floor: z.coerce.number().optional(),
  totalFloors: z.coerce.number().optional(),
  possession: z.string().optional(),
  amenities: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ListingFormProps {
  initialData?: Partial<FormData & { id: string; images: string[] }>;
  mode?: "create" | "edit";
}

export function ListingForm({ initialData, mode = "create" }: ListingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: initialData as FormData,
  });

  async function onSubmit(data: FormData) {
    setLoading(true);

    try {
      const body = {
        ...data,
        images: [],
        amenities: data.amenities ? data.amenities.split(",").map((a) => a.trim()).filter(Boolean) : [],
      };

      const url = mode === "edit" ? `/api/listings/${initialData!.id}` : "/api/listings";
      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(await res.text());
      const listing = await res.json();

      toast.success(mode === "edit" ? "Listing updated!" : "Listing published!");
      router.push(`/property/${listing.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save listing");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const errorClass = "text-xs text-red-500 mt-1";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className={labelClass}>Listing Title *</label>
          <input {...register("title")} placeholder="e.g. Spacious 2BHK with Sea View in Worli" className={inputClass} />
          {errors.title && <p className={errorClass}>{errors.title.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Listing Type *</label>
          <select {...register("type")} className={inputClass}>
            <option value="SALE">For Sale</option>
            <option value="RENT">For Rent</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Property Type *</label>
          <select {...register("propertyType")} className={inputClass}>
            <option value="RESIDENTIAL">Residential</option>
            <option value="COMMERCIAL">Commercial</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>BHK</label>
          <select {...register("bhk")} className={inputClass}>
            <option value="">Select BHK</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n} BHK</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Price (₹) *</label>
          <input {...register("price")} type="number" placeholder="e.g. 5000000" className={inputClass} />
          {errors.price && <p className={errorClass}>{errors.price.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Area (sqft)</label>
          <input {...register("area_sqft")} type="number" placeholder="e.g. 950" className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Furnishing</label>
          <select {...register("furnishing")} className={inputClass}>
            <option value="">Not specified</option>
            <option value="FURNISHED">Furnished</option>
            <option value="SEMI_FURNISHED">Semi-Furnished</option>
            <option value="UNFURNISHED">Unfurnished</option>
          </select>
        </div>
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Locality (Mumbai) *</label>
          <input {...register("locality")} list="locality-list" placeholder="e.g. Bandra West" className={inputClass} />
          <datalist id="locality-list">
            {MUMBAI_LOCALITIES.map((l) => <option key={l} value={l} />)}
          </datalist>
          {errors.locality && <p className={errorClass}>{errors.locality.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Sub-Locality</label>
          <input {...register("subLocality")} placeholder="e.g. Pali Hill" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Pincode *</label>
          <input {...register("pincode")} placeholder="e.g. 400050" className={inputClass} maxLength={6} />
          {errors.pincode && <p className={errorClass}>{errors.pincode.message}</p>}
        </div>
      </div>

      {/* Building info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className={labelClass}>Floor No.</label>
          <input {...register("floor")} type="number" placeholder="e.g. 5" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Total Floors</label>
          <input {...register("totalFloors")} type="number" placeholder="e.g. 15" className={inputClass} />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Possession</label>
          <select {...register("possession")} className={inputClass}>
            <option value="">Not specified</option>
            <option value="Ready to Move">Ready to Move</option>
            <option value="Under Construction">Under Construction</option>
          </select>
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className={labelClass}>Amenities (comma-separated)</label>
        <input
          {...register("amenities")}
          placeholder="e.g. Gym, Swimming Pool, Parking, Security"
          className={inputClass}
        />
        <p className="text-xs text-gray-400 mt-1">Separate with commas</p>
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          {...register("description")}
          rows={4}
          placeholder="Describe the property, nearby landmarks, special features..."
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3 rounded-xl text-base transition-colors flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="h-5 w-5 animate-spin" />}
        {loading ? "Saving..." : mode === "edit" ? "Update Listing" : "Publish Listing"}
      </button>
    </form>
  );
}
