"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { EditorContent, useEditor } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import {
  Table,
  TableRow,
  TableCell,
  TableHeader,
} from "@tiptap/extension-table";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";

import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  CheckSquare,
  Table2,
  Quote,
  Code,
  Minus,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  Type,
  Heading3,
} from "lucide-react";

import SlashMenu, { type SlashCommand } from "./slash-menu";

type Props = {
  slug: string;
  initialTitle: string;
  initialContent: Record<string, unknown>;
};

type SlashState = {
  from: number;
  to: number;
  query: string;
  top: number;
  left: number;
};

export default function NoteEditor({
  slug,
  initialTitle,
  initialContent,
}: Props) {
  const updateNote = useMutation(api.notes.update);

  const [title, setTitle] = useState(initialTitle);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [slash, setSlash] = useState<SlashState | null>(null);

  const titleRef = useRef(title);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slashRef = useRef<SlashState | null>(null);
  const saveRef = useRef<() => void>(() => {});

  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  const save = useCallback(
    (content: Record<string, unknown>) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      setSaveStatus("Saving...");

      timerRef.current = setTimeout(() => {
        void updateNote({
          slug,
          title: titleRef.current.trim() || "Untitled",
          content,
        })
          .then(() => setSaveStatus("Saved"))
          .catch((error: unknown) => {
            console.error("Failed to save note:", error);
            setSaveStatus("Couldn't save");
          });
      }, 700);
    },
    [slug, updateNote]
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: "Type '/' for commands, or start writing...",
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          class: "text-blue-600 underline underline-offset-2",
          rel: "noopener noreferrer",
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap-content outline-none min-h-[400px]",
        spellcheck: "true",
      },
    },
    onUpdate: ({ editor }) => {
      save(editor.getJSON() as Record<string, unknown>);
      detectSlash(editor);
    },
    onSelectionUpdate: ({ editor }) => {
      detectSlash(editor);
    },
  });

  const detectSlash = (currentEditor: Editor) => {
    const { selection } = currentEditor.state;
    const { $from } = selection;

    if (!selection.empty) {
      slashRef.current = null;
      setSlash(null);
      return;
    }

    const textBeforeCursor = $from.parent.textBetween(
      0,
      $from.parentOffset,
      "\n",
      "\n"
    );

    const match = textBeforeCursor.match(/(?:^|\s)\/([a-zA-Z]*)$/);

    if (!match) {
      slashRef.current = null;
      setSlash(null);
      return;
    }

    const query = match[1];
    const from = selection.from - query.length - 1;
    const to = selection.from;
    const coords = currentEditor.view.coordsAtPos(selection.from);

    const next: SlashState = {
      from,
      to,
      query,
      top: coords.bottom + 6,
      left: coords.left,
    };

    slashRef.current = next;
    setSlash(next);
  };

  saveRef.current = () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (editor) {
      void updateNote({
        slug,
        title: titleRef.current.trim() || "Untitled",
        content: editor.getJSON() as Record<string, unknown>,
      })
        .then(() => setSaveStatus("Saved"))
        .catch(() => setSaveStatus("Couldn't save"));
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      saveRef.current();
    };
  }, []);

  const closeSlash = useCallback(() => {
    slashRef.current = null;
    setSlash(null);
  }, []);

  const execute = useCallback(
    (command: (editor: Editor) => void) => {
      if (!editor) return;

      const currentSlash = slashRef.current;

      if (currentSlash) {
        editor
          .chain()
          .focus()
          .deleteRange({
            from: currentSlash.from,
            to: currentSlash.to,
          })
          .run();
      }

      closeSlash();
      command(editor);
    },
    [editor, closeSlash]
  );

  const commands: SlashCommand[] = editor
    ? [
        {
          title: "Text",
          description: "Plain text paragraph",
          keywords: "paragraph",
          icon: <Type size={18} />,
          run: () =>
            execute((e) => e.chain().focus().setParagraph().run()),
        },
        {
          title: "Heading 1",
          description: "Large section heading",
          keywords: "h1 title",
          icon: <Heading1 size={18} />,
          run: () =>
            execute((e) =>
              e.chain().focus().setHeading({ level: 1 }).run()
            ),
        },
        {
          title: "Heading 2",
          description: "Medium section heading",
          keywords: "h2",
          icon: <Heading2 size={18} />,
          run: () =>
            execute((e) =>
              e.chain().focus().setHeading({ level: 2 }).run()
            ),
        },
        {
          title: "Heading 3",
          description: "Small section heading",
          keywords: "h3",
          icon: <Heading3 size={18} />,
          run: () =>
            execute((e) =>
              e.chain().focus().setHeading({ level: 3 }).run()
            ),
        },
        {
          title: "Bulleted list",
          description: "Create a bullet list",
          keywords: "ul unordered list",
          icon: <List size={18} />,
          run: () =>
            execute((e) => e.chain().focus().toggleBulletList().run()),
        },
        {
          title: "Numbered list",
          description: "Create a numbered list",
          keywords: "ol ordered list",
          icon: <ListOrdered size={18} />,
          run: () =>
            execute((e) => e.chain().focus().toggleOrderedList().run()),
        },
        {
          title: "To-do list",
          description: "Track tasks with checkboxes",
          keywords: "task checkbox checklist",
          icon: <CheckSquare size={18} />,
          run: () =>
            execute((e) => e.chain().focus().toggleTaskList().run()),
        },
        {
          title: "Table",
          description: "Insert a 3 × 3 table",
          keywords: "grid cells",
          icon: <Table2 size={18} />,
          run: () =>
            execute((e) =>
              e.chain()
                .focus()
                .insertTable({
                  rows: 3,
                  cols: 3,
                  withHeaderRow: true,
                })
                .run()
            ),
        },
        {
          title: "Quote",
          description: "Insert a blockquote",
          keywords: "blockquote",
          icon: <Quote size={18} />,
          run: () =>
            execute((e) => e.chain().focus().toggleBlockquote().run()),
        },
        {
          title: "Code block",
          description: "Write formatted code",
          keywords: "programming snippet",
          icon: <Code size={18} />,
          run: () =>
            execute((e) => e.chain().focus().toggleCodeBlock().run()),
        },
        {
          title: "Divider",
          description: "Insert a horizontal line",
          keywords: "separator hr",
          icon: <Minus size={18} />,
          run: () =>
            execute((e) => e.chain().focus().setHorizontalRule().run()),
        },
      ]
    : [];

  if (!editor) {
    return (
      <div className="mx-auto max-w-3xl animate-pulse p-8">
        <div className="mb-5 h-12 w-2/3 rounded bg-zinc-100" />
        <div className="h-5 w-full rounded bg-zinc-100" />
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 pb-32 pt-8 sm:px-12 lg:px-24">
      <header className="mb-16 flex items-center justify-between gap-4">
        <a
          href="/"
          className="text-sm font-semibold tracking-tight text-zinc-800"
        >
          Paper<span className="text-amber-600">.</span>
        </a>

        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="hidden sm:inline">/{slug}</span>
          <span
            className={
              saveStatus === "Couldn't save"
                ? "text-red-500"
                : "text-emerald-600"
            }
          >
            {saveStatus}
          </span>
        </div>
      </header>

      <input
        value={title}
        onChange={(event) => {
          const value = event.target.value;
          setTitle(value);
          titleRef.current = value;

          if (editor) {
            save(editor.getJSON() as Record<string, unknown>);
          }
        }}
        placeholder="Untitled"
        maxLength={200}
        className="mb-8 w-full border-none bg-transparent text-4xl font-bold tracking-tight text-zinc-900 outline-none placeholder:text-zinc-300 sm:text-5xl"
        aria-label="Note title"
      />

      <div className="mb-8 flex flex-wrap items-center gap-1 rounded-xl border border-zinc-200 bg-white p-2">
        <ToolButton
          label="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          <Bold size={17} />
        </ToolButton>

        <ToolButton
          label="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          <Italic size={17} />
        </ToolButton>

        <ToolButton
          label="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
        >
          <UnderlineIcon size={17} />
        </ToolButton>

        <ToolButton
          label="Strikethrough"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
        >
          <Strikethrough size={17} />
        </ToolButton>

        <span className="mx-1 h-6 w-px bg-zinc-200" />

        <ToolButton
          label="Heading 1"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
        >
          <Heading1 size={17} />
        </ToolButton>

        <ToolButton
          label="Bulleted list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          <List size={17} />
        </ToolButton>

        <ToolButton
          label="Numbered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        >
          <ListOrdered size={17} />
        </ToolButton>

        <ToolButton
          label="To-do list"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          active={editor.isActive("taskList")}
        >
          <CheckSquare size={17} />
        </ToolButton>

        <ToolButton
          label="Insert table"
          onClick={() =>
            editor.chain().focus().insertTable({
              rows: 3,
              cols: 3,
              withHeaderRow: true,
            }).run()
          }
        >
          <Table2 size={17} />
        </ToolButton>

        <ToolButton
          label="Quote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
        >
          <Quote size={17} />
        </ToolButton>

        <ToolButton
          label="Code block"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
        >
          <Code size={17} />
        </ToolButton>

        <ToolButton
          label="Horizontal divider"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus size={17} />
        </ToolButton>

        <ToolButton
          label="Add link"
          onClick={() => {
            const url = window.prompt("Enter a URL");
            if (!url) return;

            try {
              const parsed = new URL(
                /^[a-z][a-z\d+.-]*:/i.test(url) ? url : `https://${url}`
              );

              if (!["http:", "https:", "mailto:"].includes(parsed.protocol)) {
                return;
              }

              editor.chain().focus().setLink({ href: parsed.href }).run();
            } catch {
              window.alert("Please enter a valid URL.");
            }
          }}
          active={editor.isActive("link")}
        >
          <LinkIcon size={17} />
        </ToolButton>
      </div>

      <div className="relative">
        <EditorContent editor={editor} />

        {slash && (
          <SlashMenu
            commands={commands}
            query={slash.query}
            top={slash.top}
            left={slash.left}
            onClose={closeSlash}
          />
        )}
      </div>

      <footer className="mt-16 border-t border-zinc-100 pt-5 text-xs text-zinc-400">
        Tip: Type / to insert a block. Your changes are saved automatically.
      </footer>
    </main>
  );
}

function ToolButton({
  label,
  onClick,
  active = false,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
        active
          ? "bg-zinc-200 text-zinc-900"
          : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
      }`}
    >
      {children}
    </button>
  );
}