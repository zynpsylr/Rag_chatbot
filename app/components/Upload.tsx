'use client'
import React, { useRef, useState } from "react";

const Upload = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                setMessage("Dosya başarıyla yüklendi.");
                if (fileInputRef.current) fileInputRef.current.value = "";
            } else {
                setMessage("Yükleme başarısız oldu.");
            }
        } catch (error) {
            setMessage("Bir hata oluştu.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                disabled={uploading}
            />
            {uploading && <div>Yükleniyor...</div>}
            {message && <div>{message}</div>}
        </div>
    );
};

export default Upload;