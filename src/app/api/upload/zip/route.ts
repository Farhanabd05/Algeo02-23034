import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';

export async function POST(request: NextRequest) {
  try {
    // Dapatkan data form
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file' }, { status: 400 });
    }

    // Validasi ekstensi file
    if (!file.name.toLowerCase().endsWith('.zip') || !file.name.toLowerCase().includes('.rar')) {
      return NextResponse.json({ error: 'Hanya file ZIP atau RAR yang diperbolehkan' }, { status: 400 });
    }

    // Konversi file ke byte array
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Buat nama file unik
    const extractPath = path.join(process.cwd(), 'public', 'uploads');

    // Pastikan direktori uploads ada
    const imageDir = path.join(process.cwd(), 'public', 'uploads', 'image');
    const audioDir = path.join(process.cwd(), 'public', 'uploads', 'audio');
    
    await Promise.all([
      fs.promises.mkdir(imageDir, { recursive: true }),
      fs.promises.mkdir(audioDir, { recursive: true })
    ]);

    // Ekstraksi file
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();

    // Proses setiap file dalam ZIP
    zipEntries.forEach((zipEntry) => {
      // Hindari folder
      if (zipEntry.isDirectory) return;

      const entryName = zipEntry.entryName;
      const fileExtension = path.extname(entryName).toLowerCase();
      
      // Tentukan folder tujuan berdasarkan ekstensi
      let destinationFolder = '';
      if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(fileExtension)) {
        destinationFolder = path.join(extractPath, 'image');
      } else if (['.mid', '.wav'].includes(fileExtension)) {
        destinationFolder = path.join(extractPath, 'audio');
      } else {
        // Abaikan file yang tidak termasuk dalam kategori
        return;
      }

      // Buat path file tujuan
      const destinationPath = path.join(destinationFolder, path.basename(entryName));
      
      // Ekstrak file
      fs.writeFileSync(destinationPath, zipEntry.getData());
    });

    return NextResponse.json({ 
      message: 'Upload dan ekstraksi berhasil'
    });

  } catch (error) {
    console.error('Error upload:', error);
    return NextResponse.json({ 
      error: 'Gagal upload dan ekstraksi' 
    }, { status: 500 });
  }
}
