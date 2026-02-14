import Link from "next/link";
import { createHousehold } from "@/lib/actions/households";

export default function NewHouseholdPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/households"
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          &larr; Back to Households
        </Link>
        <h1 className="text-2xl font-bold mt-2">New Household</h1>
      </div>

      <form action={createHousehold} className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Household Name *
          </label>
          <input
            name="name"
            required
            placeholder="e.g. The Johnson Family"
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Address
          </label>
          <input
            name="address"
            placeholder="123 Main Street"
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
        >
          Create Household
        </button>
      </form>
    </div>
  );
}
