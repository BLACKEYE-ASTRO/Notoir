"use client";

import { useEffect, useState } from "react";

export type SlashCommand = {
  title: string;
  description: string;
  keywords: string;
  icon: React.ReactNode;
  run: () => void;
};

type Props = {
  commands: SlashCommand[];
  query: string;
  top: number;
  left: number;
  onClose: () => void;
};

export default function SlashMenu({
  commands,
  query,
  top,
  left,
  onClose,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = commands.filter((command) =>
    `${command.title} ${command.description} ${command.keywords}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (activeIndex >= filtered.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, filtered.length]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!filtered.length) return;

      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        event.stopPropagation();
        setActiveIndex((index) => (index + 1) % filtered.length);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        event.stopPropagation();
        setActiveIndex(
          (index) => (index - 1 + filtered.length) % filtered.length
        );
        return;
      }

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();

        const selectedCommand = filtered[activeIndex];

        if (selectedCommand) {
          selectedCommand.run();
        }
      }
    }

    // Capture the keyboard event before Tiptap handles Enter.
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [filtered, activeIndex, onClose]);

  if (!filtered.length) return null;

  return (
    <div
      className="fixed z-50 w-72 overflow-hidden rounded-xl border border-zinc-200 bg-white p-2 shadow-2xl"
      style={{
        top:
          typeof window !== "undefined"
            ? Math.max(8, Math.min(top, window.innerHeight - 360))
            : top,
        left:
          typeof window !== "undefined"
            ? Math.max(8, Math.min(left, window.innerWidth - 300))
            : left,
      }}
      onMouseDown={(event) => event.preventDefault()}
    >
      <p className="px-2 py-2 text-xs font-medium text-zinc-400">
        BLOCKS
      </p>

      <div className="max-h-72 overflow-y-auto">
        {filtered.map((command, index) => (
          <button
            key={command.title}
            type="button"
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => command.run()}
            className={`flex w-full items-center gap-3 rounded-lg p-2 text-left ${
              activeIndex === index ? "bg-zinc-100" : "hover:bg-zinc-50"
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-200 text-zinc-600">
              {command.icon}
            </span>

            <span className="min-w-0">
              <span className="block text-sm font-medium text-zinc-900">
                {command.title}
              </span>
              <span className="block truncate text-xs text-zinc-500">
                {command.description}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
