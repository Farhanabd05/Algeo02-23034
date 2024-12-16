"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function ZipUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [selectedJsonFile, setSelectedJsonFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false); // tambahkan state untuk loading
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

  const handleJsonFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validasi tipe file (hanya JSON)
      if (!file.name.toLowerCase().endsWith('.json')) {
        toast({
          title: "Error",
          description: "Silakan pilih file JSON",
          variant: "destructive"
        });
        return;
      }

      setSelectedJsonFile(file);
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
    setIsLoading(true); 

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
    } finally {
      setIsLoading(false); // set loading state ke false setelah upload selesai
    }
  };

  const handleJsonUpload = async () => {
    if (!selectedJsonFile) {
      toast({
        title: "Error",
        description: "Silakan pilih file JSON terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    try {
      // Membuat FormData
      const formData = new FormData();
      formData.append('file', selectedJsonFile);

      // Kirim ke API route untuk upload JSON
      const response = await fetch('/api/upload/json', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "File JSON berhasil diupload",
          variant: "default"
        });

        // Reset state setelah upload
        setSelectedJsonFile(null);
      } else {
        toast({
          title: "Error",
          description: result.error || "Gagal mengupload file JSON",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Gagal mengupload file JSON",
        variant: "destructive"
      });
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
          disabled={!selectedFile || isLoading} // tambahkan kondisi disabled jika sedang loading
          className="w-full"
        >
          {isLoading ? (
            <div className="flex justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" fill="currentColor" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Mengunggah...
            </div>
          ) : (
            'Upload dan Ekstrak ZIP'
          )}
        </Button>
        <h1 className="text-2xl mb-4">Upload File JSON</h1>
        <Input 
          type="file" 
          accept=".json"
          onChange={handleJsonFileChange}
          className="w-full"
        />

        {selectedJsonFile && (
          <div className="mt-2">
            <p>Nama File: {selectedJsonFile.name}</p>
          </div>
        )}

        <Button 
          onClick={handleJsonUpload}
          disabled={!selectedJsonFile}
          className="w-full"
        >
          Upload JSON
        </Button>
      </div>
    </div>
  );
}
