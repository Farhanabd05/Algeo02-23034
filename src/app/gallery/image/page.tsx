// src/app/gallery/audio/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface MappedFile {
  audio: {
    name: string;
    path: string;
    score?: string;
  };
  image: {
    name: string;
    path: string;
    distance?: number;
  };
}

// Tambahkan tipe untuk similarImages
interface SimilarImage {
  filename: string;
  distance: number;
}

export default function ImageSearchingPage() {
  const [mappedFiles, setMappedFiles] = useState<MappedFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<MappedFile[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTime, setSearchTime] = useState<number | null>(null);
  const itemsPerPage = 6;
  const { toast } = useToast();

  useEffect(() => {
    async function fetchMappedFiles() {
      setLoading(true);
      try {
        const response = await fetch("/api/mapped-files");
        const data = await response.json();
        const files = data.mappings || [];
        setMappedFiles(files);
        setFilteredFiles(files);
        setTotalPages(Math.ceil(files.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching mapped files:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMappedFiles();

    // Dynamically load the MIDI player script
    if (!document.querySelector("script[src*='html-midi-player']")) {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/combine/npm/tone@14.7.58,npm/@magenta/music@1.23.1/es6/core.js,npm/html-midi-player@1.5.0";
      script.async = true;
      document.body.appendChild(script);
      script.onload = () => {
        console.log("MIDI player script loaded");
      };
  
      return () => {
        document.body.removeChild(script);
      };
    }
  
  }, []);

  const handleImageSearch = async () => {
    if (!selectedImage) {
      toast({
        title: "Error",
        description: "Silakan pilih gambar terlebih dahulu",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const startTime = Date.now();
    try {
      const formData = new FormData();
      formData.append("image", selectedImage);

      const response = await fetch("/api/image-search", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        // Filter mapped files based on search results
        const similarFiles = result.similarImages
          .map((similarImage: SimilarImage) => {
            const mappedFile = mappedFiles.find(
              (file) => file.image.name === similarImage.filename
            );

            // Tambahkan distance ke objek mappedFile
            return mappedFile
              ? {
                  ...mappedFile,
                  image: {
                    ...mappedFile.image,
                    distance: similarImage.distance,
                  },
                }
              : null;
          })
          .filter(Boolean);

        setFilteredFiles(similarFiles);
        console.log(similarFiles.length);
        setTotalPages(Math.ceil(similarFiles.length / itemsPerPage));
        setCurrentPage(1);

        if (similarFiles.length === 0) {
          toast({
            title: "Informasi",
            description: "Tidak ditemukan file audio yang mirip",
            variant: "default",
          });
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Gagal mencari gambar",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Image search error:", error);
      toast({
        title: "Error",
        description: "Gagal melakukan pencarian gambar",
        variant: "destructive",
      });
    } finally {
      const endTime = Date.now();
      const searchTime = endTime - startTime;
      setSearchTime(searchTime);
      setLoading(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validasi tipe file (hanya gambar)
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Silakan pilih file gambar",
          variant: "destructive",
        });
        return;
      }

      // Validasi ukuran file (maks 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Ukuran file terlalu besar (maks 10MB)",
          variant: "destructive",
        });
        return;
      }

      setSelectedImage(file);
    }
  };

  const resetSearch = () => {
    setFilteredFiles(mappedFiles);
    setTotalPages(Math.ceil(mappedFiles.length / itemsPerPage));
    setCurrentPage(1);
    setSelectedImage(null);
  };

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMappedFiles = filteredFiles.slice(startIndex, endIndex);

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
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <svg
            className="animate-spin h-5 w-5 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-6">Image Searching</h1>
          {/* Rest of the existing content */}
          <div className="mb-6 flex items-center space-x-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full max-w-md"
            />
            <Button
              onClick={handleImageSearch}
              disabled={!selectedImage}
              className=""
            >
              Cari Gambar Serupa
            </Button>
            <Button onClick={resetSearch} variant="outline" className="">
              Reset
            </Button>
          </div>

          {selectedImage && (
            <div className="mb-4">
              <p>Gambar yang dipilih: {selectedImage.name}</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {currentMappedFiles.map((file) => (
              <Card
                key={file.audio.name}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-4 flex flex-col items-center">
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center mb-2">
                    {file.image.path ? (
                      <img
                        src={file.image.path}
                        alt={file.image.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-500"
                      >
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                      </svg>
                    )}
                  </div>

                  {/* Conditional rendering for MIDI or audio files */}
                  {file.audio.name.endsWith(".mid") ? (
                    <midi-player
                      src={file.audio.path}
                      sound-font
                      className="w-full"
                    ></midi-player>
                  ) : (
                    <audio controls className="w-full">
                      <source src={file.audio.path} />
                      Your browser does not support the audio element.
                    </audio>
                  )}

                  <p className="mt-2 text-sm text-center truncate w-full">
                    {file.audio.name}
                  </p>
                  {/* {console.log('File in Card:', file)} */}
                  {file.image.distance !== undefined && (
                    <p className="mt-1 text-sm text-center w-full text-blue-500">
                      Distance: {file.image.distance.toFixed(2)}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Pagination Controls */}
          <div className="flex flex-col justify-center items-center mt-6 space-y-4">
            {/* Waktu Pencarian */}
            {searchTime !== null && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
                <span className="font-bold">Waktu Pencarian:</span> {searchTime}{" "}
                ms
              </div>
            )}

            {/* Button Navigasi dengan Informasi Halaman */}
            <div className="flex justify-center items-center space-x-4">
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
        </>
      )}
    </div>
  );
}