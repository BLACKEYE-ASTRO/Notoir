
import { Suspense } from "react";
import NotePage from "@/components/note-page";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function NoteContent({ params }: PageProps) {
  const { slug } = await params;

  return <NotePage slug={slug} />;
}

export default function Page({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-muted-foreground">
          Loading note...
        </div>
      }
    >
      <NoteContent params={params} />
    </Suspense>
  );
}
