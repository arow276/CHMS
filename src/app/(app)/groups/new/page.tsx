import Link from "next/link";
import { createGroup } from "@/lib/actions/groups";

export default function NewGroupPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/groups"
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          &larr; Back to Groups
        </Link>
        <h1 className="text-2xl font-bold mt-2">New Group</h1>
      </div>

      <form action={createGroup} className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Group Name *
          </label>
          <input
            name="name"
            required
            placeholder="e.g. Tuesday Life Group"
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Type *
          </label>
          <select
            name="type"
            required
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="LIFE_GROUP">Life Group</option>
            <option value="MINISTRY">Ministry</option>
            <option value="CLASS">Class</option>
            <option value="COMMITTEE">Committee</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            rows={2}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Meeting Day
            </label>
            <select
              name="meetingDay"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="">None</option>
              <option>Sunday</option>
              <option>Monday</option>
              <option>Tuesday</option>
              <option>Wednesday</option>
              <option>Thursday</option>
              <option>Friday</option>
              <option>Saturday</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Meeting Time
            </label>
            <input
              name="meetingTime"
              placeholder="7:00 PM"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
        >
          Create Group
        </button>
      </form>
    </div>
  );
}
