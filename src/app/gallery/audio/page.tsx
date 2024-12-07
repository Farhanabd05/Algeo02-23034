"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface MappedFile {
  audio: {
    name: string;
    path: string;
  };
  image: {
    name: string;
    path: string;
  };
}

export default function AudioGalleryPage() {
  const [mappedFiles, setMappedFiles] = useState<MappedFile[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

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

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMappedFiles = mappedFiles.slice(startIndex, endIndex);

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
      <h1 className="text-3xl font-bold mb-6">Audio Gallery</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {currentMappedFiles.map((file) => (
          <Card key={file.audio.name} className="hover:shadow-lg transition-shadow">
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

              <p className="mt-2 text-sm text-center truncate w-full">{file.audio.name}</p>
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
