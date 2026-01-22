import React, { useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { uploadImageClient } from '@/lib/cloudinary-client';
import { showToast } from '@/components/custom/custom-toast';

// Dynamic import for ReactQuill with 'any' cast to bypass ref type mismatch
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false }) as any;

interface BlogEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ value, onChange, disabled }) => {
  const quillRef = useRef<any>(null);

  // Custom Image Handler
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (file) {
        try {
          // Convert to base64 for preview/upload (or modify uploadImageClient to accept File)
          // Here assuming uploadImageClient takes base64 string or we fix it to take File
          
          // Let's use FileReader to get base64 first as existing patterns often use base64
          const reader = new FileReader();
          reader.onload = async () => {
            const base64 = reader.result as string;
             // Show loading/placeholder if needed?
            const url = await uploadImageClient(base64);
            
            const quill = quillRef.current.getEditor();
            const range = quill.getSelection();
            quill.insertEmbed(range.index, 'image', url);
          };
          reader.readAsDataURL(file);

        } catch (error) {
          console.error(error);
          showToast({ message: 'Lỗi tải ảnh lên', type: 'error' });
        }
      }
    };
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean'],
        [{ 'color': [] }, { 'background': [] }],
      ],
      handlers: {
        image: imageHandler,
      },
    },
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'indent',
    'align',
    'link', 'image', 'video',
    'color', 'background'
  ];

  return (
    <div className="bg-white rounded-md">
       <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        readOnly={disabled}
        className="h-96 mb-12" // Add margin bottom for toolbar spacing if needed
      />
    </div>
  );
};

export default BlogEditor;
