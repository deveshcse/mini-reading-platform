"use client";

import React, { useCallback, useEffect } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link2,
  ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Underline as UnderlineIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface StoryRichTextEditorProps {
  id?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-invalid"?: boolean;
}

function chainLink(editor: Editor) {
  const previous = editor.getAttributes("link").href as string | undefined;
  const url = window.prompt("URL", previous ?? "https://");
  if (url === null) return;
  if (url === "") {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }
  editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
}

function chainImage(editor: Editor) {
  const url = window.prompt("Image URL", "https://");
  if (!url) return;
  editor.chain().focus().setImage({ src: url }).run();
}

function MenuButton({
  onClick,
  active,
  disabled,
  children,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon-sm"
      className="h-8 w-8 rounded-none border-0"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
    >
      {children}
    </Button>
  );
}

function EditorToolbar({ editor, disabled }: { editor: Editor | null; disabled: boolean }) {
  if (!editor) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-0.5 border-2 border-b-0 border-input bg-muted/40 p-1"
      role="toolbar"
      aria-label="Formatting"
    >
      <MenuButton
        label="Bold"
        active={editor.isActive("bold")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="size-4" />
      </MenuButton>
      <MenuButton
        label="Italic"
        active={editor.isActive("italic")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-4" />
      </MenuButton>
      <MenuButton
        label="Underline"
        active={editor.isActive("underline")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="size-4" />
      </MenuButton>
      <MenuButton
        label="Strikethrough"
        active={editor.isActive("strike")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="size-4" />
      </MenuButton>
      <MenuButton
        label="Highlight"
        active={editor.isActive("highlight")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      >
        <Highlighter className="size-4" />
      </MenuButton>

      <Separator orientation="vertical" className="mx-0.5 h-6" />

      <MenuButton
        label="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="size-4" />
      </MenuButton>
      <MenuButton
        label="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="size-4" />
      </MenuButton>

      <Separator orientation="vertical" className="mx-0.5 h-6" />

      <MenuButton
        label="Bullet list"
        active={editor.isActive("bulletList")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="size-4" />
      </MenuButton>
      <MenuButton
        label="Ordered list"
        active={editor.isActive("orderedList")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" />
      </MenuButton>
      <MenuButton
        label="Blockquote"
        active={editor.isActive("blockquote")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="size-4" />
      </MenuButton>

      <Separator orientation="vertical" className="mx-0.5 h-6" />

      <MenuButton
        label="Align left"
        active={editor.isActive({ textAlign: "left" })}
        disabled={disabled}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeft className="size-4" />
      </MenuButton>
      <MenuButton
        label="Align center"
        active={editor.isActive({ textAlign: "center" })}
        disabled={disabled}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter className="size-4" />
      </MenuButton>
      <MenuButton
        label="Align right"
        active={editor.isActive({ textAlign: "right" })}
        disabled={disabled}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <AlignRight className="size-4" />
      </MenuButton>

      <Separator orientation="vertical" className="mx-0.5 h-6" />

      <MenuButton
        label="Add link"
        active={editor.isActive("link")}
        disabled={disabled}
        onClick={() => chainLink(editor)}
      >
        <Link2 className="size-4" />
      </MenuButton>
      <MenuButton label="Add image" disabled={disabled} onClick={() => chainImage(editor)}>
        <ImageIcon className="size-4" />
      </MenuButton>

      <Separator orientation="vertical" className="mx-0.5 h-6" />

      <MenuButton
        label="Undo"
        disabled={disabled || !editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo className="size-4" />
      </MenuButton>
      <MenuButton
        label="Redo"
        disabled={disabled || !editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo className="size-4" />
      </MenuButton>
    </div>
  );
}

const extensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    bulletList: { keepMarks: true, keepAttributes: false },
    orderedList: { keepMarks: true, keepAttributes: false },
  }),
  Underline,
  Highlight.configure({ multicolor: false }),
  Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } }),
  Image.configure({ inline: true, allowBase64: false }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
];

export function StoryRichTextEditor({
  id,
  value,
  onChange,
  placeholder = "Start writing your story…",
  disabled = false,
  className,
  "aria-invalid": ariaInvalid,
}: StoryRichTextEditorProps) {
  const onUpdate = useCallback(
    (html: string) => {
      onChange(html);
    },
    [onChange]
  );

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        ...extensions,
        Placeholder.configure({ placeholder, showOnlyWhenEditable: true, showOnlyCurrent: false }),
      ],
      content: value,
      editable: !disabled,
      editorProps: {
        attributes: {
          ...(id ? { id } : {}),
          class:
            "story-editor-prose min-h-[min(50vh,420px)] w-full max-w-none px-4 py-3 text-sm outline-none focus:outline-none",
          "data-slot": "story-editor-content",
        },
      },
      onUpdate: ({ editor: e }) => {
        onUpdate(e.getHTML());
      },
    },
    []
  );

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value === current) return;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  return (
    <div
      className={cn(
        "story-editor rounded-none",
        ariaInvalid && "ring-2 ring-destructive/40",
        className
      )}
      data-disabled={disabled ? "" : undefined}
    >
      <EditorToolbar editor={editor} disabled={disabled} />
      <div className="border-2 border-input bg-background">
        <EditorContent editor={editor} className="story-editor-surface" />
      </div>
    </div>
  );
}
