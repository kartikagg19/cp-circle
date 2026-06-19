import { ListingForm } from "@/components/ListingForm";

export default function AddListingPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Listing</h1>
        <p className="text-sm text-gray-500 mt-1">Fill in the details to publish your property</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <ListingForm mode="create" />
      </div>
    </div>
  );
}
