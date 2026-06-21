import { useMemo, useRef, useCallback } from 'react';
import ReactQuill from 'react-quill-new';
import { uploadApi } from '../../api/index.js';

export default function RichTextEditor({ value, onChange }) {
  const quillRef = useRef(null);

  // Custom image handler: file picker -> /api/upload -> insert returned URL.
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.click();
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const editor = quillRef.current?.getEditor();
      const range = editor?.getSelection(true);
      const index = range ? range.index : editor.getLength();
      // placeholder while uploading
      editor.insertText(index, ' (تصویر اپ لوڈ ہو رہی ہے…) ');
      try {
        const url = await uploadApi.image(file);
        editor.deleteText(index, ' (تصویر اپ لوڈ ہو رہی ہے…) '.length);
        editor.insertEmbed(index, 'image', url);
        editor.setSelection(index + 1);
      } catch (err) {
        editor.deleteText(index, ' (تصویر اپ لوڈ ہو رہی ہے…) '.length);
        // eslint-disable-next-line no-alert
        alert('Image upload failed: ' + err.message);
      }
    };
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['blockquote', 'link', 'image'],
          [{ align: [] }],
          [{ direction: 'rtl' }],
          ['clean'],
        ],
        handlers: { image: imageHandler },
      },
      clipboard: { matchVisual: false },
    }),
    [imageHandler]
  );

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'blockquote',
    'link',
    'image',
    'align',
    'direction',
  ];

  return (
    <div className="rounded-lg border border-gray-300 bg-white">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder="یہاں خبر کا متن لکھیں…"
      />
    </div>
  );
}
