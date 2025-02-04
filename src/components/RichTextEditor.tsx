import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import FontFamily from '@tiptap/extension-font-family';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { 
  Bold, Italic, Code, Link as LinkIcon, Image as ImageIcon, 
  List, ListOrdered, Quote, AlignLeft, AlignCenter, AlignRight, 
  Palette, X, Strikethrough, Underline as UnderlineIcon,
  Minus, Type as FontFamilyIcon
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const commonColors = [
  { name: 'Черный', value: '#000000' },
  { name: 'Красный', value: '#ef4444' },
  { name: 'Зеленый', value: '#22c55e' },
  { name: 'Синий', value: '#3b82f6' },
  { name: 'Желтый', value: '#eab308' },
  { name: 'Белый', value: '#ffffff' },
];

const fontFamilies = [
  { name: 'Default', value: 'Inter' },
  { name: 'Serif', value: 'Merriweather' },
  { name: 'Mono', value: 'JetBrains Mono' },
  { name: 'Handwriting', value: 'Dancing Script' },
  { name: 'Display', value: 'Bebas Neue' },
];

const addGoogleFonts = () => {
  const fonts = [
    'Inter:400,500,600',
    'Merriweather:400,700',
    'JetBrains+Mono:400,500',
    'Dancing+Script:400,700',
    'Bebas+Neue'
  ];
  
  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?${fonts.map(f => `family=${f}`).join('&')}&display=swap`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontFamily, setShowFontFamily] = useState(false);

  useEffect(() => {
    addGoogleFonts();
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      TextStyle,
      Color,
      Underline,
      Strike,
      HorizontalRule,
      FontFamily.configure({
        types: ['textStyle'],
        fonts: fontFamilies.map(f => ({
          name: f.name,
          value: f.value,
        })),
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-700 underline',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      TextAlign.configure({
        types: ['paragraph', 'heading'],
        alignments: ['left', 'center', 'right'],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const addLink = () => {
    const url = window.prompt('URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          if (file.size > 5 * 1024 * 1024) {
            alert('Файл слишком большой. Максимальный размер: 5MB');
            return;
          }

          if (!file.type.startsWith('image/')) {
            alert('Пожалуйста, выберите изображение');
            return;
          }

          const base64 = await fileToBase64(file);
          editor.chain().focus().setImage({ src: base64 }).run();
        } catch (error) {
          console.error('Error adding image:', error);
          alert('Ошибка при загрузке изображения');
        }
      }
    };

    input.click();
  };

  if (!editor) return null;

  return (
    <div className="h-full flex flex-col bg-white rounded-lg">
      <div className="bg-gray-100 p-3 border-b flex flex-wrap gap-2 sticky top-0 z-10">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
        >
          <Bold size={20} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
        >
          <Italic size={20} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('code') ? 'bg-gray-200' : ''}`}
        >
          <Code size={20} />
        </button>
        <button
          onClick={addLink}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
        >
          <LinkIcon size={20} />
        </button>
        <button
          onClick={addImage}
          className="p-2 rounded hover:bg-gray-200 relative group"
        >
          <ImageIcon size={20} />
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Нажмите для загрузки изображения
          </span>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
        >
          <List size={20} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
        >
          <ListOrdered size={20} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`}
        >
          <Quote size={20} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
        >
          <AlignLeft size={20} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
        >
          <AlignCenter size={20} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
        >
          <AlignRight size={20} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('strike') ? 'bg-gray-200' : ''}`}
        >
          <Strikethrough size={20} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
        >
          <UnderlineIcon size={20} />
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded hover:bg-gray-200"
        >
          <Minus size={20} />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowFontFamily(!showFontFamily)}
            className={`p-2 rounded hover:bg-gray-200 flex items-center gap-1 ${
              showFontFamily ? 'bg-gray-200' : ''
            }`}
          >
            <FontFamilyIcon size={20} />
          </button>
          
          {showFontFamily && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border z-50 min-w-[200px]">
              {fontFamilies.map((font) => (
                <button
                  key={font.value}
                  onClick={() => {
                    editor.chain().focus().setFontFamily(font.value).run();
                    setShowFontFamily(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  style={{ fontFamily: font.value }}
                >
                  {font.name}
                </button>
              ))}
              <button
                onClick={() => {
                  editor.chain().focus().unsetFontFamily().run();
                  setShowFontFamily(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-600"
              >
                По умолчанию
              </button>
            </div>
          )}
        </div>
      </div>
      <EditorContent 
        editor={editor} 
        className="prose max-w-none p-6 flex-1 overflow-y-auto min-h-[400px]"
      />
    </div>
  );
};

export default RichTextEditor; 