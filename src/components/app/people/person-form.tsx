"use client";

import { useActionState } from "react";

type PersonData = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  status: string;
  gender: string | null;
  dateOfBirth: Date | string | null;
  householdId: string | null;
  householdRole: string;
  notes: string | null;
};

export function PersonForm({
  person,
  action,
  households,
}: {
  person?: PersonData;
  action: (prev: unknown, formData: FormData) => Promise<unknown>;
  households: { id: string; name: string }[];
}) {
  const [error, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
          {String(error)}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            First Name *
          </label>
          <input
            name="firstName"
            required
            defaultValue={person?.firstName ?? ""}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Last Name *
          </label>
          <input
            name="lastName"
            required
            defaultValue={person?.lastName ?? ""}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Email
          </label>
          <input
            name="email"
            type="email"
            defaultValue={person?.email ?? ""}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Phone
          </label>
          <input
            name="phone"
            defaultValue={person?.phone ?? ""}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Status *
          </label>
          <select
            name="status"
            required
            defaultValue={person?.status ?? "VISITOR"}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="VISITOR">Visitor</option>
            <option value="REGULAR">Regular</option>
            <option value="MEMBER">Member</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Gender
          </label>
          <select
            name="gender"
            defaultValue={person?.gender ?? ""}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="">Not specified</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Date of Birth
          </label>
          <input
            name="dateOfBirth"
            type="date"
            defaultValue={
              person?.dateOfBirth
                ? new Date(person.dateOfBirth).toISOString().split("T")[0]
                : ""
            }
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Household
          </label>
          <select
            name="householdId"
            defaultValue={person?.householdId ?? ""}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="">None</option>
            {households.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Household Role
          </label>
          <select
            name="householdRole"
            defaultValue={person?.householdRole ?? "MEMBER"}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="HEAD">Head</option>
            <option value="SPOUSE">Spouse</option>
            <option value="CHILD">Child</option>
            <option value="MEMBER">Member</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">
          Notes
        </label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={person?.notes ?? ""}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
        >
          {isPending ? "Saving..." : person ? "Save Changes" : "Add Person"}
        </button>
      </div>
    </form>
  );
}
