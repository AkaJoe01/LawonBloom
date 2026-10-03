"use client";

import { EditorContent, NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer, useEditor, type NodeViewProps } from "@tiptap/react";
import { useMemo, useState, type FormEvent } from "react";
import type { JSONContent } from "@tiptap/core";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Info,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Play,
  Quote,
  Redo2,
  Stethoscope,
  Table2,
  Underline,
  Undo2,
} from "lucide-react";
import { Callout, Embed, VIMEO_EMBED, YOUTUBE_EMBED, createBaseExtensions } from "@/lib/tiptap/extensions";
import type { TiptapDoc } from "@/lib/validation/post";

const calloutClass = (variant: string) =>
  `callout callout-${variant === "medical" ? "medical" : "note"} border-l-4 rounded-md bg-surface-container-low px-4 py-3`;

function CalloutView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const variant = node.attrs.variant === "medical" ? "medical" : "note";
  return (
    <NodeViewWrapper className={calloutClass(variant)} data-variant={variant}>
      <div contentEditable={false} className="mb-2 flex items-center gap-2">
        <select
          aria-label="Callout variant"
          value={variant}
          onChange={(event) => updateAttributes({ variant: event.target.value })}
          className="rounded border border-outline-variant bg-background px-2 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <option value="note">Note callout</option>
          <option value="medical">Medical callout</option>
        </select>
        <button
          type="button"
          onClick={() => deleteNode()}
          aria-label="Remove callout"
          className="rounded px-2 py-1 text-xs text-on-surface-variant hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Remove
        </button>
      </div>
      <NodeViewContent as="div" />
    </NodeViewWrapper>
  );
}

function EmbedView({ node, deleteNode }: NodeViewProps) {
  const provider = node.attrs.provider === "vimeo" ? "Vimeo" : "YouTube";
  return (
    <NodeViewWrapper as="div" contentEditable={false} className="flex flex-wrap items-center gap-3 rounded-md border border-outline-variant bg-surface-container-low px-4 py-3">
      <span className="inline-flex items-center gap-1.5 rounded bg-error/10 px-2 py-1 text-xs font-medium text-error">
        <span aria-hidden="true">▶</span>
        {provider} embed
      </span>
      <a
        href={node.attrs.url}
        target="_blank"
        rel="noopener noreferrer"
        className="truncate text-xs text-primary underline-offset-4 hover:underline"
      >
        {node.attrs.url}
      </a>
      <button
        type="button"
        onClick={() => deleteNode()}
        className="ml-auto rounded px-2 py-1 text-xs text-on-surface-variant hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Remove
      </button>
    </NodeViewWrapper>
  );
}

function ToolButton({
  label,
  pressed,
  disabled,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40 ${
        pressed ? "bg-primary-container text-on-primary-fixed" : "text-on-surface-variant hover:bg-surface-container-high hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

const inputClass =
  "mt-1 w-full rounded-md border border-outline-variant bg-background px-2 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export default function TiptapEditor({
  initialContent,
  onChange,
}: {
  initialContent: TiptapDoc;
  onChange: (doc: TiptapDoc) => void;
}) {
  const [toolbarError, setToolbarError] = useState<string | null>(null);
  const [imageForm, setImageForm] = useState<{ src: string; alt: string; caption: string; decorative: boolean } | null>(null);

  const extensions = useMemo(
    () =>
      createBaseExtensions().map((extension) => {
        if (extension.name === "callout") {
          return Callout.extend({ addNodeView: () => ReactNodeViewRenderer(CalloutView) });
        }
        if (extension.name === "embed") {
          return Embed.extend({ addNodeView: () => ReactNodeViewRenderer(EmbedView) });
        }
        return extension;
      }),
    [],
  );

  const editor = useEditor({
    extensions,
    content: initialContent as unknown as JSONContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "post-body min-h-64 rounded-md bg-background px-1 py-3 focus:outline-none",
        "aria-label": "Post body",
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(current.getJSON() as unknown as TiptapDoc);
    },
  });

  if (!editor) {
    return <div className="h-64 animate-pulse rounded-md border border-outline-variant bg-background" aria-hidden="true" />;
  }

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("Link URL (https://, /path, or #anchor)", previous ?? "https://");
    if (href === null) return;
    if (href.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setToolbarError(null);
      return;
    }
    const value = href.trim();
    if (!/^https?:\/\//i.test(value) && !value.startsWith("/") && !value.startsWith("#")) {
      setToolbarError("Links must start with https://, /, or #");
      return;
    }
    setToolbarError(null);
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: value, target: "_blank", rel: "noopener noreferrer" })
      .run();
  };

  const insertEmbed = () => {
    const url = window.prompt("Embed URL (youtube-nocookie.com/embed/… or player.vimeo.com/video/…)");
    if (!url) return;
    const value = url.trim();
    const provider = YOUTUBE_EMBED.test(value) ? "youtube" : VIMEO_EMBED.test(value) ? "vimeo" : null;
    if (!provider) {
      setToolbarError("Embed URL must be a youtube-nocookie embed or Vimeo player link.");
      return;
    }
    setToolbarError(null);
    editor.chain().focus().insertContent({ type: "embed", attrs: { provider, url: value } }).run();
  };

  const submitImage = (event: FormEvent) => {
    event.preventDefault();
    if (!imageForm) return;
    const src = imageForm.src.trim();
    if (!/^https?:\/\//i.test(src) && !src.startsWith("/")) {
      setToolbarError("Image URL must be https:// or site-relative.");
      return;
    }
    setToolbarError(null);
    editor
      .chain()
      .focus()
      .insertContent({
        type: "image",
        attrs: {
          src,
          alt: imageForm.alt.trim() || null,
          caption: imageForm.caption.trim() || null,
          "data-decorative": imageForm.decorative,
        },
      })
      .run();
    setImageForm(null);
  };

  const active = (name: string, attrs?: Record<string, unknown>) => editor.isActive(name, attrs);
  const tableActive = editor.isActive("table");

  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest">
      <div
        role="toolbar"
        aria-label="Text formatting"
        aria-orientation="horizontal"
        className="flex flex-wrap items-center gap-1 border-b border-outline-variant px-2 py-2"
      >
        <ToolButton label="Bold" pressed={active("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={16} />
        </ToolButton>
        <ToolButton label="Italic" pressed={active("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={16} />
        </ToolButton>
        <ToolButton label="Underline" pressed={active("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <Underline size={16} />
        </ToolButton>
        <ToolButton label="Inline code" pressed={active("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code size={16} />
        </ToolButton>
        <span aria-hidden="true" className="mx-1 h-5 w-px bg-outline-variant" />
        <ToolButton label="Heading level 2" pressed={active("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={16} />
        </ToolButton>
        <ToolButton label="Heading level 3" pressed={active("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 size={16} />
        </ToolButton>
        <ToolButton label="Bulleted list" pressed={active("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={16} />
        </ToolButton>
        <ToolButton label="Numbered list" pressed={active("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={16} />
        </ToolButton>
        <ToolButton label="Blockquote" pressed={active("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={16} />
        </ToolButton>
        <ToolButton label="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus size={16} />
        </ToolButton>
        <span aria-hidden="true" className="mx-1 h-5 w-px bg-outline-variant" />
        <ToolButton label={active("link") ? "Remove link" : "Add link"} pressed={active("link")} onClick={setLink}>
          <Link2 size={16} />
        </ToolButton>
        <ToolButton label="Insert image" pressed={Boolean(imageForm)} onClick={() => setImageForm({ src: "", alt: "", caption: "", decorative: false })}>
          <ImageIcon size={16} />
        </ToolButton>
        <ToolButton label="Insert table" pressed={tableActive} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
          <Table2 size={16} />
        </ToolButton>
        <ToolButton label="Insert note callout" pressed={active("callout", { variant: "note" })} onClick={() => editor.chain().focus().insertContent({ type: "callout", attrs: { variant: "note" }, content: [{ type: "paragraph" }] }).run()}>
          <Info size={16} />
        </ToolButton>
        <ToolButton label="Insert medical callout" pressed={active("callout", { variant: "medical" })} onClick={() => editor.chain().focus().insertContent({ type: "callout", attrs: { variant: "medical" }, content: [{ type: "paragraph" }] }).run()}>
          <Stethoscope size={16} />
        </ToolButton>
        <ToolButton label="Insert video embed" onClick={insertEmbed}>
          <Play size={16} />
        </ToolButton>
        <span aria-hidden="true" className="mx-1 h-5 w-px bg-outline-variant" />
        <ToolButton label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 size={16} />
        </ToolButton>
        <ToolButton label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 size={16} />
        </ToolButton>

        {tableActive ? (
          <span className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="rounded px-2 py-1 text-xs text-foreground hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Add row
            </button>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="rounded px-2 py-1 text-xs text-foreground hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Add column
            </button>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="rounded px-2 py-1 text-xs text-error hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Delete table
            </button>
          </span>
        ) : null}
      </div>

      {toolbarError ? (
        <p role="alert" className="border-b border-outline-variant bg-error-container/30 px-3 py-2 text-xs text-on-error-container">
          {toolbarError}
        </p>
      ) : null}

      {imageForm ? (
        <form onSubmit={submitImage} className="grid gap-3 border-b border-outline-variant bg-background px-3 py-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="img-src" className="text-xs font-medium text-foreground">
              Image URL
            </label>
            <input
              id="img-src"
              value={imageForm.src}
              onChange={(event) => setImageForm({ ...imageForm, src: event.target.value })}
              placeholder="https://… or /images/…"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="img-alt" className="text-xs font-medium text-foreground">
              Alt text
            </label>
            <input
              id="img-alt"
              value={imageForm.alt}
              onChange={(event) => setImageForm({ ...imageForm, alt: event.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="img-caption" className="text-xs font-medium text-foreground">
              Caption (optional)
            </label>
            <input
              id="img-caption"
              value={imageForm.caption}
              onChange={(event) => setImageForm({ ...imageForm, caption: event.target.value })}
              className={inputClass}
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-foreground sm:col-span-2">
            <input
              type="checkbox"
              checked={imageForm.decorative}
              onChange={(event) => setImageForm({ ...imageForm, decorative: event.target.checked })}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            Decorative image (ignore for screen readers — requires empty alt)
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-on-primary hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Insert image
            </button>
            <button
              type="button"
              onClick={() => setImageForm(null)}
              className="rounded-md border border-outline-variant px-3 py-1.5 text-xs text-foreground hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <EditorContent editor={editor} />
    </div>
  );
}
