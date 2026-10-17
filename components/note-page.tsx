"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import NoteEditor from "./note-editor";

export default function NotePage({ slug }: { slug: string }) {
  const note = useQuery(api.notes.getBySlug, { slug });
  const createIfMissing = useMutation(api.notes.createIfMissing);
  const [error, setError] = useState("");

  useEffect(() => {
    if (note !== null) return;

    let cancelled = false;

    createIfMissing({ slug })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to create note."
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [note, slug, createIfMissing]);

  if (error) {
    return (
      <div className="mx-auto max-w-xl p-10">
        <h1 className="text-xl font-semibold">Unable to open note</h1>
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <a className="mt-5 inline-block underline" href="/">
          Return home
        </a>
      </div>
    );
  }

  if (note === undefined || note === null) {
    return (
      <div className="mx-auto max-w-3xl animate-pulse p-10">
        <div className="mb-6 h-10 w-2/3 rounded bg-zinc-100" />
        <div className="h-4 w-full rounded bg-zinc-100" />
      </div>
    );
  }

  return (
    <NoteEditor
      key={note._id}
      slug={note.slug}
      initialTitle={note.title}
      initialContent={note.content as Record<string, unknown>}
    />
  );
}