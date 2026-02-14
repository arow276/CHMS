import Link from "next/link";
import { getPeople } from "@/lib/dal/people";
import { PeopleTable } from "@/components/app/people/people-table";
import { PeopleFilters } from "@/components/app/people/people-filters";
import { Suspense } from "react";

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    warmth?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const { people, total, page, totalPages } = await getPeople({
    search: params.search,
    status: params.status,
    warmth: params.warmth,
    page: params.page ? parseInt(params.page) : 1,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">People</h1>
          <p className="text-sm text-zinc-400 mt-1">{total} people total</p>
        </div>
        <Link
          href="/people/new"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
        >
          Add Person
        </Link>
      </div>

      <Suspense>
        <PeopleFilters />
      </Suspense>
      <PeopleTable people={people} />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/people?${new URLSearchParams({
                ...(params.search ? { search: params.search } : {}),
                ...(params.status ? { status: params.status } : {}),
                ...(params.warmth ? { warmth: params.warmth } : {}),
                page: String(p),
              }).toString()}`}
              className={`px-3 py-1 rounded text-sm ${
                p === page
                  ? "bg-amber-500 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
