"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogTitle, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface ImageFile {
  name: string;
  path: string;
}

export default function ImageGalleryPage() {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const itemsPerPage = 6;

  useEffect(() => {
    async function fetchImageFiles() {
      try {
        const response = await fetch('/api/image-files');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get('Content-Type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Invalid response type. Expected JSON.');
        }
        const data = await response.json();
        setImageFiles(data.files);
        setTotalPages(Math.ceil(data.files.length / itemsPerPage));
      } catch (error) {
        console.error('Error fetching image files:', error);
      }
    }
    fetchImageFiles();
  }, []);

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentImageFiles = imageFiles.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Image Gallery</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {currentImageFiles.map((image) => (
          <Card key={image.name} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <Dialog>
                <DialogTrigger asChild>
                  <div 
                    className="w-full h-48 relative cursor-pointer"
                    onClick={() => setSelectedImage(`/uploads/image/${image.name}`)}
                  >
                    <Image 
                      src={`/uploads/image/${image.name}`} 
                      alt={image.name}
                      fill
                      className="object-cover rounded-md"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <VisuallyHidden>
                    <DialogTitle>{image.name}</DialogTitle>
                  </VisuallyHidden>
                  <Image 
                    src={`/uploads/image/${image.name}`} 
                    alt={image.name}
                    width={800}
                    height={600}
                    className="object-contain w-full h-auto"
                  />
                </DialogContent>
              </Dialog>
              <p className="mt-2 text-sm text-center truncate">{image.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>
  
      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-6 space-x-4">
        <Button 
          onClick={handlePrevPage} 
          disabled={currentPage === 1}
          variant="outline"
        >
          Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button 
          onClick={handleNextPage} 
          disabled={currentPage === totalPages}
          variant="outline"
        >
          Next
        </Button>
      </div>
    </div>
  );
  
}