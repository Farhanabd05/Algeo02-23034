//src/app/api/upload/zip/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';
import { exec } from 'child_process';
import util from 'util';

export async function POST(request: NextRequest) {
  try {
    // Dapatkan data form
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file' }, { status: 400 });
    }

    // Validasi ekstensi file
    if (!file.name.toLowerCase().endsWith('.zip')) {
      return NextResponse.json({ error: 'Hanya file ZIP atau RAR yang diperbolehkan' }, { status: 400 });
    }

    // Konversi file ke byte array
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Buat nama file unik
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
    const folderTempImage = path.join(process.cwd(), 'public', 'uploads', 'temp', 'image');
    fs.mkdirSync(folderTempImage, { recursive: true });

    // Proses setiap file dalam ZIP
    zipEntries.forEach(async (zipEntry) => {
      // Hindari folder
      if (zipEntry.isDirectory) return;

      const entryName = zipEntry.entryName;
      const fileExtension = path.extname(entryName).toLowerCase();
      
      // Tentukan folder tujuan berdasarkan ekstensi
      let destinationFolder = '';
      if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(fileExtension)) {
        destinationFolder = imageDir;
        fs.writeFileSync(path.join(folderTempImage, path.basename(entryName)), zipEntry.getData());
      } else if (['.mid', '.wav'].includes(fileExtension)) {
        destinationFolder = audioDir;
      } else {
        // Abaikan file yang tidak termasuk dalam kategori
        return;
      }
      // Buat path file tujuan
      const destinationPath = path.join(destinationFolder, path.basename(entryName));
      
      // Ekstrak file
      fs.writeFileSync(destinationPath, zipEntry.getData());
    });
    
    const execPromise = util.promisify(exec);
    
    async function inputNewImage(folderPath: string) {
      try {
        const scriptPath = `"${path.join(process.cwd(), 'src', 'app', 'api', 'image-retrieval', 'processNewImage.py')}"`;
        const { stdout, stderr } = await execPromise(`python "${scriptPath}" --folder="${folderPath}"`);
        if (stderr) {
          console.error('Error:', stderr);
        }
        console.log('Output:', stdout);
      } catch (error) {
        console.error('Execution error:', error);
      }
    }
    await inputNewImage(folderTempImage);
    fs.rmdirSync(folderTempImage, { recursive: true });
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