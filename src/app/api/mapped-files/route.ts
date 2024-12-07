// src/app/api/mapped-files/route.ts
import {NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const mapperPath = path.join(process.cwd(), 'public', 'mapper.json');
    const audioDirectory = path.join(process.cwd(), 'public', 'uploads', 'audio');
    // const imageDirectory = path.join(process.cwd(), 'public', 'uploads', 'image');
    const placeholderImage = '/file.svg'; // Placeholder jika tidak ada pasangan gambar

    // Baca mapper.json
    if (!fs.existsSync(mapperPath)) {
      throw new Error('mapper.json tidak ditemukan');
    }

    const mapperData = JSON.parse(await fs.promises.readFile(mapperPath, 'utf-8'));

    // Pastikan mapperData adalah array
    if (!Array.isArray(mapperData)) {
      throw new Error('Format mapper.json harus berupa array');
    }

    // Baca file audio dari direktori
    const audioFiles = await fs.promises.readdir(audioDirectory);

    // Buat mapping audio -> image berdasarkan mapper.json
    const mappings = audioFiles.map((audioFile) => {
      // Cari pasangan gambar berdasarkan nama audio di mapper.json
      const mapping = mapperData.find((entry) => entry.audio === audioFile);

      // Jika ada pasangan gambar, gunakan gambar tersebut
      const imageName = mapping?.image;
      const imagePath = imageName
        ? `/uploads/image/${imageName}` // Gambar yang cocok
        : placeholderImage; // Placeholder jika tidak ada pasangan gambar

      return {
        audio: {
          name: audioFile,
          path: `/uploads/audio/${audioFile}`,
        },
        image: {
          name: imageName || 'placeholder.png',
          path: imagePath,
        },
      };
    });

    return NextResponse.json({ mappings, total: mappings.length });
  } catch (error) {
    console.error('Error reading files or creating mappings:', error);
    return NextResponse.json(
      { error: 'Gagal membaca file dan membuat mapping' },
      { status: 500 }
    );
  }
}
