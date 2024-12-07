"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function ZipUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const { toast } = useToast();
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validasi tipe file (hanya ZIP)
      if (!file.name.toLowerCase().endsWith('.zip')) {
        toast({
          title: "Error",
          description: "Silakan pilih file ZIP",
          variant: "destructive"
        });
        return;
      }

      // Validasi ukuran file (maks 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Ukuran file terlalu besar (maks 50MB)",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
      setFileSize(file.size);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Silakan pilih file terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    try {
      // Membuat FormData
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Kirim ke API route untuk upload
      const response = await fetch('/api/upload/zip', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "File ZIP berhasil diupload dan diekstrak",
          variant: "default"
        });
        
        // Reset state setelah upload
        setSelectedFile(null);
        setFileSize(null);
      } else {
        toast({
          title: "Error",
          description: result.error || "Gagal mengupload file",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Gagal mengupload file",
        variant: "destructive"
      })
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">Upload File ZIP</h1>
      
      <div className="space-y-4">
        <Input 
          type="file" 
          accept=".zip"
          onChange={handleFileChange}
          className="w-full"
        />

        {selectedFile && (
          <div className="mt-2">
            <p>Nama File: {selectedFile.name}</p>
            <p>Ukuran File: {(fileSize! / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}

        <Button 
          onClick={handleUpload}
          disabled={!selectedFile}
          className="w-full"
        >
          Upload dan Ekstrak ZIP
        </Button>
      </div>
    </div>
  );
}