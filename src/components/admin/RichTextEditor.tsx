import { useEffect, useRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { safeHtml } from '@/lib/safe-html';

export function RichTextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const emitted = useRef(value);
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false } }), Image.configure({ allowBase64: true })],
    content: safeHtml(value),
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: { class: 'prose max-w-none min-h-64 p-4 focus:outline-none', role: 'textbox', 'aria-label': 'Zengin metin içeriği', 'aria-multiline': 'true' },
      transformPastedHTML: safeHtml,
    },
    onUpdate: ({ editor: current }) => { emitted.current = safeHtml(current.getHTML()); onChange(emitted.current); },
  });
  useEffect(() => {
    if (editor && value !== emitted.current) {
      emitted.current = value;
      editor.commands.setContent(safeHtml(value), { emitUpdate: false });
    }
  }, [editor, value]);
  if (!editor) return <div className="min-h-64 p-4" role="status">Editör hazırlanıyor…</div>;
  const link = () => {
    const url = window.prompt('Bağlantı adresi', editor.getAttributes('link').href || 'https://');
    if (url === null) return;
    if (!url.trim()) { editor.chain().focus().unsetLink().run(); return; }
    if (/^(https?:\/\/|mailto:|tel:|\/(?!\/))\S+$/i.test(url.trim())) editor.chain().focus().setLink({ href: url.trim(), target: '_blank' }).run();
  };
  const image = () => {
    const src = window.prompt('Görsel adresi (HTTPS veya site içi yol)');
    if (src && /^(https:\/\/|\/(?!\/))\S+$/i.test(src.trim())) editor.chain().focus().setImage({ src: src.trim(), alt: window.prompt('Görsel açıklaması') || '' }).run();
  };
  const actions: [string, () => void, boolean?][] = [
    ['Başlık 2', () => { editor.chain().focus().toggleHeading({ level: 2 }).run(); }, editor.isActive('heading', { level: 2 })],
    ['Başlık 3', () => { editor.chain().focus().toggleHeading({ level: 3 }).run(); }, editor.isActive('heading', { level: 3 })],
    ['Kalın', () => { editor.chain().focus().toggleBold().run(); }, editor.isActive('bold')],
    ['İtalik', () => { editor.chain().focus().toggleItalic().run(); }, editor.isActive('italic')],
    ['Altı çizili', () => { editor.chain().focus().toggleUnderline().run(); }, editor.isActive('underline')],
    ['Üstü çizili', () => { editor.chain().focus().toggleStrike().run(); }, editor.isActive('strike')],
    ['Numaralı liste', () => { editor.chain().focus().toggleOrderedList().run(); }, editor.isActive('orderedList')],
    ['Madde listesi', () => { editor.chain().focus().toggleBulletList().run(); }, editor.isActive('bulletList')],
    ['Alıntı', () => { editor.chain().focus().toggleBlockquote().run(); }, editor.isActive('blockquote')],
    ['Kod', () => { editor.chain().focus().toggleCodeBlock().run(); }, editor.isActive('codeBlock')],
    ['Bağlantı', link, editor.isActive('link')], ['Görsel', image],
    ['Biçimi temizle', () => { editor.chain().focus().clearNodes().unsetAllMarks().run(); }],
  ];
  return <div><div role="toolbar" aria-label="Metin biçimlendirme" className="flex flex-wrap gap-1 border-b border-border p-2">{actions.map(([label, run, active]) => <button key={label} type="button" aria-pressed={active ?? false} onClick={run} className={`rounded px-2 py-1 text-xs border border-border ${active ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}>{label}</button>)}</div><EditorContent editor={editor} /></div>;
}
