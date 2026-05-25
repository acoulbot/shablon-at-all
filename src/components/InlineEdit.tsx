"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";

interface InlineEditContextType {
  editing: boolean;
  toggle: () => void;
  token: string;
}

const InlineEditContext = createContext<InlineEditContextType>({ editing: false, toggle: () => {}, token: "" });

export function useInlineEdit() {
  return useContext(InlineEditContext);
}

export function InlineEditProvider({ children }: { children: ReactNode }) {
  const [editing, setEditing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("admin_token");
    if (t) {
      setToken(t);
      fetch("/api/admin/categories", { headers: { Authorization: `Bearer ${t}` } })
        .then((r) => { if (r.ok) setIsAdmin(true); })
        .catch(() => {});
    }
  }, []);

  const toggle = useCallback(() => setEditing((p) => !p), []);

  if (!isAdmin) return <InlineEditContext.Provider value={{ editing: false, toggle, token }}>{children}</InlineEditContext.Provider>;

  return (
    <InlineEditContext.Provider value={{ editing, toggle, token }}>
      {children}
      <button
        onClick={toggle}
        className={`fixed bottom-4 right-4 z-[9999] px-4 py-2.5 rounded-full shadow-lg font-medium text-sm transition-all ${
          editing
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-primary hover:bg-primary-dark text-white"
        }`}
      >
        {editing ? "✕ Выйти из редактирования" : "✎ Редактировать"}
      </button>
    </InlineEditContext.Provider>
  );
}

/* ─── EditableText ─── */

interface EditableTextProps {
  contentKey: string;
  defaultValue: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  className?: string;
  multiline?: boolean;
}

export function EditableText({ contentKey, defaultValue, as: Tag = "span", className = "", multiline = false }: EditableTextProps) {
  const { editing, token } = useInlineEdit();
  const [value, setValue] = useState(defaultValue);
  const [saved, setSaved] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    fetch(`/api/admin/inline?keys=${contentKey}`)
      .then((r) => r.json())
      .then((data) => { if (data[contentKey]) setValue(data[contentKey]); })
      .catch(() => {});
  }, [contentKey]);

  const save = useCallback(async () => {
    const el = ref.current;
    if (!el) return;
    const newValue = el.innerText.trim();
    if (newValue === value) return;
    setValue(newValue);
    try {
      await fetch("/api/admin/inline", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key: contentKey, value: newValue }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch { /* ignore */ }
  }, [contentKey, token, value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
  };

  if (!editing) {
    return <Tag className={className}>{value}</Tag>;
  }

  return (
    <Tag
      ref={ref as React.Ref<never>}
      contentEditable
      suppressContentEditableWarning
      onBlur={save}
      onKeyDown={handleKeyDown}
      className={`${className} outline-none border-2 border-dashed border-primary/50 hover:border-primary rounded px-1 cursor-text transition-colors ${saved ? "border-green-500 bg-green-50/50" : ""}`}
    >
      {value}
    </Tag>
  );
}

/* ─── EditableImage ─── */

interface EditableImageProps {
  src: string;
  alt: string;
  className?: string;
  onSave?: (newUrl: string) => Promise<void>;
}

export function EditableImage({ src, alt, className = "", onSave }: EditableImageProps) {
  const { editing, token } = useInlineEdit();
  const fileRef = useRef<HTMLInputElement>(null);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setCurrentSrc(data.url);
        if (onSave) await onSave(data.url);
      }
    } catch { /* ignore */ }
  };

  if (!editing) {
    /* eslint-disable-next-line @next/next/no-img-element */
    return <img src={currentSrc} alt={alt} className={className} />;
  }

  return (
    <div className="relative group/img inline-block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={currentSrc} alt={alt} className={`${className} border-2 border-dashed border-primary/50 hover:border-primary cursor-pointer transition-colors`} />
      <button
        onClick={() => fileRef.current?.click()}
        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity rounded"
      >
        <span className="bg-white text-text-dark px-3 py-1.5 rounded-lg text-sm font-medium shadow">Заменить</span>
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
    </div>
  );
}

/* ─── SortableList ─── */

interface SortableItem {
  id: string;
}

interface SortableListProps<T extends SortableItem> {
  items: T[];
  onReorder: (orderedIds: string[]) => Promise<void>;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  itemClassName?: string;
  direction?: "horizontal" | "vertical";
}

export function SortableList<T extends SortableItem>({
  items: initialItems,
  onReorder,
  renderItem,
  className = "",
  itemClassName = "",
  direction = "horizontal",
}: SortableListProps<T>) {
  const { editing } = useInlineEdit();
  const [items, setItems] = useState(initialItems);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => setItems(initialItems), [initialItems]);

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverItem.current = index;
  };

  const handleDrop = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;

    const newItems = [...items];
    const dragged = newItems[dragItem.current];
    newItems.splice(dragItem.current, 1);
    newItems.splice(dragOverItem.current, 0, dragged);
    setItems(newItems);
    dragItem.current = null;
    dragOverItem.current = null;

    await onReorder(newItems.map((i) => i.id));
  };

  if (!editing) {
    return (
      <div className={className}>
        {items.map((item, i) => (
          <div key={item.id} className={itemClassName}>{renderItem(item, i)}</div>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      {items.map((item, i) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => handleDragStart(i)}
          onDragOver={(e) => handleDragOver(e, i)}
          onDrop={handleDrop}
          className={`${itemClassName} cursor-grab active:cursor-grabbing border-2 border-dashed border-transparent hover:border-primary/50 rounded-lg transition-colors relative`}
        >
          <div className={`absolute ${direction === "horizontal" ? "-top-2 left-1/2 -translate-x-1/2" : "-left-2 top-1/2 -translate-y-1/2"} z-10 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full opacity-0 hover:opacity-100 transition-opacity`}>
            ⇅ {i + 1}
          </div>
          {renderItem(item, i)}
        </div>
      ))}
    </div>
  );
}
