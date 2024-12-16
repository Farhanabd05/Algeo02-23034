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
    score: number;
  };
  image: {
    name: string;
    path: string;
  };
}

// Tambahkan tipe untuk similarImages
interface SimilarAudio {
  filename: string;
  score: number;
}
export default function AudioSearchingPage() {
  const [mappedFiles, setMappedFiles] = useState<MappedFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<MappedFile[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTime, setSearchTime] = useState<number | null>(null);
  const itemsPerPage = 6;
  const { toast } = useToast();

  useEffect(() => {
    async function fetchMappedFiles() {
      try {
        const response = await fetch("/api/mapped-files");
        const data = await response.json();
        setMappedFiles(data.mappings || []);
        setTotalPages(Math.ceil((data.mappings || []).length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching mapped files:", error);
      }
    }
    fetchMappedFiles();
    // Dynamically load the MIDI player script
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
  }, []);
  const handleAudioSearch = async () => {
    if (!selectedAudio) {
      toast({
        title: "Error",
        description: "Silakan pilih audio terlebih dahulu",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const startTime = Date.now();
    try {
      const formData = new FormData();
      formData.append("audio", selectedAudio);

      const response = await fetch("/api/audio-search", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        const similarFiles = result.similarAudios
          .map((similarAudio: SimilarAudio) => {
            const mappedFile = mappedFiles.find(
              (file) => file.audio.name === similarAudio.filename
            );

            // Tambahkan distance ke objek mappedFile
            return mappedFile
              ? {
                  ...mappedFile,
                  audio: {    
                    ...mappedFile.audio,
                    score: similarAudio.score,
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
          description: result.error || "Terjadi kesalahan",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Audio search error:", error);
      toast({
        title: "Error",
        description: "Gagal melakukan pencarian audio",
        variant: "destructive",
      });
    } finally {
      const endTime = Date.now();
      const searchTime = endTime - startTime;
      setSearchTime(searchTime);
      setLoading(false);
    }
  };

  const handleAudioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validasi tipe file (hanya gambar)
      if (!file.type.startsWith("audio/")) {
        toast({
          title: "Error",
          description: "Silakan pilih file audio",
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

      setSelectedAudio(file);
    }
  }
  const resetSearch = () => {
    setFilteredFiles(mappedFiles);
    setTotalPages(Math.ceil(mappedFiles.length / itemsPerPage));
    setCurrentPage(1);
    setSelectedAudio(null);
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
            <h1 className="text-3xl font-bold mb-6">Audio Searching</h1>
            {/* Rest of the existing content */}
            <div className="mb-6 flex items-center space-x-4">
              <Input
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                className="w-full max-w-md"
              />
              <Button
                onClick={handleAudioSearch}
                disabled={!selectedAudio}
                className=""
              >
                Cari Audio Serupa
              </Button>
              <Button onClick={resetSearch} variant="outline" className="">
                Reset
              </Button>
            </div>
  
            {selectedAudio && (
              <div className="mb-4">
                <p>Gambar yang dipilih: {selectedAudio.name}</p>
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
                      {file.audio.path ? (
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
                    {file.audio.score !== undefined && (
                      <p className="mt-1 text-sm text-center w-full text-blue-500">
                        Score: {file.audio.score.toFixed(2)}
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
  