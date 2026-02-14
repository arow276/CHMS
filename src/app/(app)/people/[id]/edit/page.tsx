import { notFound } from "next/navigation";
import Link from "next/link";
import { getPersonById } from "@/lib/dal/people";
import { PersonForm } from "@/components/app/people/person-form";
import { updatePerson } from "@/lib/actions/people";
import { db } from "@/lib/db";

export default async function EditPersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = await getPersonById(id);
  if (!person) notFound();

  const households = await db.household.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  async function action(_prev: unknown, formData: FormData) {
    "use server";
    try {
      await updatePerson(id, formData);
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
          href={`/people/${person.id}`}
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          &larr; Back to {person.firstName} {person.lastName}
        </Link>
        <h1 className="text-2xl font-bold mt-2">
          Edit {person.firstName} {person.lastName}
        </h1>
      </div>
      <PersonForm person={person} action={action} households={households} />
    </div>
  );
}
