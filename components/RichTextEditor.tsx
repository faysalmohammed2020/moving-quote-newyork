// components/RichTextEditor.tsx
"use client";

import React from "react";
import { Editor } from "@tinymce/tinymce-react";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  height = 560, // ⬅️ শুধু এটুকু বড় করলাম
}) => {
  // Upload helper: sends the file to /api/upload and returns the URL (e.g. "/image/xxx.jpg")
  const uploadToServer = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const msg = await res.json().catch(() => ({}));
      throw new Error(msg?.error || "Upload failed");
    }
    const data = await res.json();
    return data.url as string; // e.g. "/image/12345.jpg"
  };

  return (
    <Editor
      apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
      tinymceScriptSrc={`https://cdn.tiny.cloud/1/${process.env.NEXT_PUBLIC_TINYMCE_API_KEY}/tinymce/6/tinymce.min.js`} // ✅ env থেকে নিল
      value={value}
      onEditorChange={onChange}
      init={{
        height,
        menubar: true,
        plugins: [
          "advlist",
          "autolink",
          "lists",
          "link",
          "image",
          "charmap",
          "preview",
          "anchor",
          "searchreplace",
          "visualblocks",
          "code",
          "fullscreen",
          "insertdatetime",
          "media",
          "table",
          "code",
          "help",
          "wordcount",
          "paste",
          "autoresize",
        ],
        toolbar:
          "undo redo | blocks | " +
          "bold italic forecolor | alignleft aligncenter " +
          "alignright alignjustify | bullist numlist outdent indent | " +
          "removeformat | image | code | help",

        // 🔥 শুধু writing field বড় / আরামদায়ক করার জন্য আপডেট
        content_style: `
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            font-size: 17px;
            line-height: 1.85;
            padding: 28px 30px;
            box-sizing: border-box;
            margin: 0;
            background: #ffffff;
          }
          p {
            margin: 0 0 1em;
          }
          img {
            max-width: 100%;
            height: auto;
            border-radius: 6px;
          }
          h1, h2, h3, h4, h5, h6 {
            margin-top: 1.2em;
            margin-bottom: 0.55em;
          }
          ul, ol {
            padding-left: 1.6em;
            margin: 0.5em 0 1em;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          table, th, td {
            border: 1px solid #e5e7eb;
          }
          th, td {
            padding: 6px 8px;
          }
        `,
        
        // ✅ Image upload config
        automatic_uploads: true,
        paste_data_images: true, // paste করলে data URI এলে আপলোড করব

        /**
         * Toolbar-এর Image বাটন, paste, drag-n-drop—TinyMCE এখানেই blob দেয়।
         * আমরা সার্ভারে আপলোড করে URL রিটার্ন করলে TinyMCE নিজে <img src="..."> বসায়।
         */
        images_upload_handler: async (blobInfo: any /*, progress: (p:number)=>void*/) => {
          const file = blobInfo.blob();
          const url = await uploadToServer(file);
          return url; // TinyMCE expects a string URL
        },

        /**
         * Image button ক্লিক করলে কাস্টম ফাইল পিকার চালু হবে।
         * এখানে ফাইল নিলে একইভাবে /api/upload এ পাঠিয়ে callback(url) করি।
         */
        file_picker_types: "image",
        file_picker_callback: (callback: (url: string, meta?: any) => void, _value, meta) => {
          if (meta.filetype !== "image") return;

          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = async () => {
            const file = (input.files && input.files[0]) as File;
            if (!file) return;
            try {
              const url = await uploadToServer(file);
              callback(url, { alt: file.name });
            } catch (e: any) {
              alert(e?.message || "Image upload failed");
            }
          };
          input.click();
        },
      }}
    />
  );
};

export default RichTextEditor;
