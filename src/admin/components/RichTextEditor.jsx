import { useMemo, useRef, useCallback } from 'react';
import ReactQuill from 'react-quill-new';
import { uploadApi } from '../../api/index.js';

// Convert a share/watch URL from common providers into an embeddable URL.
// Unknown providers are returned unchanged (paste an embed URL directly).
function toEmbedUrl(raw) {
  const url = (raw || '').trim();
  let m;
  if ((m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)))
    return `https://www.youtube.com/embed/${m[1]}`;
  if ((m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/))) return `https://player.vimeo.com/video/${m[1]}`;
  if ((m = url.match(/dailymotion\.com\/(?:video|embed\/video)\/([a-zA-Z0-9]+)/)))
    return `https://www.dailymotion.com/embed/video/${m[1]}`;
  return url;
}

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

  // Video handler: ask for a URL, normalize it to an embed URL, insert player.
  const videoHandler = useCallback(() => {
    // eslint-disable-next-line no-alert
    const url = window.prompt('ویڈیو لنک (YouTube, Vimeo, Dailymotion…)');
    if (!url) return;
    const editor = quillRef.current?.getEditor();
    const range = editor?.getSelection(true);
    const index = range ? range.index : editor.getLength();
    editor.insertEmbed(index, 'video', toEmbedUrl(url), 'user');
    editor.setSelection(index + 1);
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['blockquote', 'link', 'image', 'video'],
          [{ align: [] }],
          [{ direction: 'rtl' }],
          ['clean'],
        ],
        handlers: { image: imageHandler, video: videoHandler },
      },
      clipboard: { matchVisual: false },
    }),
    [imageHandler, videoHandler]
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
    'video',
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
