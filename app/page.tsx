"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  ArrowUpRight,
  Trash2,
} from "lucide-react";

export default function Home() {
  const router = useRouter();

  const notes = useQuery(api.notes.getAll);
  const createIfMissing = useMutation(api.notes.createIfMissing);
  const removeNote = useMutation(api.notes.remove);

  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  async function createNote(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const normalizedSlug = slug
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    if (
      !normalizedSlug ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug) ||
      normalizedSlug.length > 120
    ) {
      setError("Use lowercase letters, numbers, and hyphens.");
      return;
    }

    setCreating(true);
    setError("");

    try {
      await createIfMissing({ slug: normalizedSlug });
      router.push(`/notes/${normalizedSlug}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create note."
      );
      setCreating(false);
    }
  }

  async function deleteNote(noteSlug: string) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${noteSlug}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingSlug(noteSlug);
    setDeleteError("");

    try {
      await removeNote({ slug: noteSlug });
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Unable to delete note."
      );
    } finally {
      setDeletingSlug(null);
    }
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <a href="/" className="text-xl font-bold tracking-tight">
          Notoir<span className="text-amber-600">.</span>
        </a>
        <span className="text-sm text-zinc-400">
          Your personal workspace
        </span>
      </nav>

      <section className="mx-auto max-w-3xl px-6 pb-24 pt-16 sm:pt-24">
        <p className="mb-4 text-sm font-medium text-amber-700">
          YOUR SPACE, YOUR IDEAS
        </p>

        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Think clearly.
          <br />
          <span className="text-zinc-400">Write freely.</span>
        </h1>

        <p className="mt-5 max-w-xl leading-7 text-zinc-500">
          A quiet space for your notes, plans, ideas, and everything
          you want to remember.
        </p>

        <form
          onSubmit={createNote}
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-zinc-200 px-4 focus-within:border-amber-500">
            <span className="shrink-0 text-sm text-zinc-400">
              /notes/
            </span>

            <input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="my-first-note"
              maxLength={120}
              className="min-w-0 flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-zinc-300"
              aria-label="Note URL slug"
            />
          </div>

          <button
            type="submit"
            disabled={creating}
            className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-4 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50"
          >
            <Plus size={17} />
            {creating ? "Opening..." : "Create note"}
          </button>
        </form>

        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}

        <div className="mt-20">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your notes</h2>

            <span className="text-xs text-zinc-400">
              {notes ? `${notes.length} notes` : "Loading..."}
            </span>
          </div>

          {deleteError && (
            <p
              role="alert"
              className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {deleteError}
            </p>
          )}

          {notes && notes.length > 0 ? (
            <div className="divide-y divide-zinc-100 border-y border-zinc-100">
              {[...notes]
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .map((note) => (
                  <div
                    key={note._id}
                    className="group flex items-center gap-3 py-5"
                  >
                    <a
                      href={`/notes/${note.slug}`}
                      className="flex min-w-0 flex-1 items-center gap-4"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 transition group-hover:bg-amber-50 group-hover:text-amber-700">
                        <FileText size={20} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-medium">
                          {note.title || "Untitled"}
                        </h3>

                        <p className="mt-1 truncate text-xs text-zinc-400">
                          /notes/{note.slug}
                        </p>
                      </div>

                      <ArrowUpRight
                        size={18}
                        className="shrink-0 text-zinc-300 transition group-hover:text-zinc-700"
                      />
                    </a>

                    <button
                      type="button"
                      onClick={() => deleteNote(note.slug)}
                      disabled={deletingSlug !== null}
                      aria-label={`Delete ${note.title || note.slug}`}
                      title="Delete note"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingSlug === note.slug ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                      ) : (
                        <Trash2 size={17} />
                      )}
                    </button>
                  </div>
                ))}
            </div>
          ) : notes?.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 px-6 py-12 text-center">
              <FileText
                className="mx-auto mb-3 text-zinc-300"
                size={28}
              />

              <p className="font-medium">Your workspace is empty</p>

              <p className="mt-2 text-sm text-zinc-400">
                Create your first note using the field above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="h-16 animate-pulse rounded-xl bg-zinc-50" />
              <div className="h-16 animate-pulse rounded-xl bg-zinc-50" />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}