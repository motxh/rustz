import React, { useMemo } from 'react';
import JoditEditor from 'jodit-react';
import { useAdminTheme } from '../context/AdminThemeContext';

interface JoditEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const JoditWrapper: React.FC<JoditEditorProps> = ({ content, onChange }) => {
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  const config = useMemo(() => ({
    height: 500,
    buttons: [
      'source',
      '|',
      'bold',
      'strikethrough',
      'underline',
      'italic',
      '|',
      'ul',
      'ol',
      '|',
      'outdent',
      'indent',
      '|',
      'font',
      'fontsize',
      'brush',
      'paragraph',
      '|',
      'image',
      'video',
      'table',
      'link',
      '|',
      'align',
      'undo',
      'redo',
      '|',
      'hr',
      'eraser',
      'copyformat',
      '|',
      'fullsize',
    ],
    uploader: {
      insertImageAsBase64URI: true
    },
    theme: isDark ? 'dark' : 'default',
    language: 'ru',
    toolbarAdaptive: false,
    showCharsCounter: false,
    showWordsCounter: false,
    showXPathInStatusbar: false,
  }), [isDark]);

  return (
    <JoditEditor
      value={content}
      config={config}
      onChange={newContent => onChange(newContent)}
    />
  );
};

export default JoditWrapper; 