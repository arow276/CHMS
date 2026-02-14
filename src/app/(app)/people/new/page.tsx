import { db } from "@/lib/db";
import { PersonForm } from "@/components/app/people/person-form";
import { createPerson } from "@/lib/actions/people";
import Link from "next/link";

export default async function NewPersonPage() {
  const households = await db.household.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  async function action(_prev: unknown, formData: FormData) {
    "use server";
    try {
      await createPerson(formData);
    } catch (e) {
      if (e instanceof Error && e.message !== "NEXT_REDIRECT") {
        return e.message;
      }
      throw e;
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/people"
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          &larr; Back to People
        </Link>
        <h1 className="text-2xl font-bold mt-2">Add Person</h1>
      </div>
      <PersonForm action={action} households={households} />
    </div>
  );
}
