import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST(request: NextRequest) {
    console.log('API POST request received');
    try {
        // Ambil file gambar dari request
        const formData = await request.formData();
        const image = formData.get('image') as File;

        if (!image) {
            console.log('No image uploaded');
            return NextResponse.json({ error: 'Tidak ada gambar yang diunggah' }, { status: 400 });
        }

        console.log('Image received:', image.name);

        // Simpan gambar sementara
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'temp');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        // rename image name to query.jpg
        const imagePath = path.join(uploadDir, 'query.jpg');
        const imageBuffer = await image.arrayBuffer();
        fs.writeFileSync(imagePath, Buffer.from(imageBuffer));

        console.log('Image saved temporarily at:', imagePath);

        // Direktori gambar untuk pencarian
        const imageDirectory = path.join(process.cwd(), 'public', 'uploads', 'image');

        // Jalankan skrip Python untuk pencarian gambar
        const pythonScriptPath = path.join(process.cwd(), 'src', 'app', 'api', 'image-retrieval', 'imageSearching.py');
        const command = `python "${pythonScriptPath}" "${imagePath}" "${imageDirectory}"`;

        console.log('Executing Python script with command:', command);

        const { stdout, stderr } = await execPromise(command);

        // Hapus gambar sementara
        // fs.unlinkSync(imagePath);
        fs.unlink(imagePath, (error) => {
            if (error) {
                console.error('Error deleting temporary image:', error);
            } else {
                console.log('Temporary image deleted:', imagePath);
            }
        });

        // console.log('Python script output:', stdout);

        // Cek jika ada error saat menjalankan skrip Python

        if (stderr) {
            console.error('Error executing Python script:', stderr);
            return NextResponse.json({ error: 'Gagal mencari gambar' }, { status: 500 });
        }

        // Parse output dari Python script sebagai JSON
        const similarImages = JSON.parse(stdout.trim());
        console.log('Similar images found:', similarImages);
        
        return NextResponse.json({ 
            message: 'Pencarian gambar berhasil', 
            similarImages 
        });
    } catch (error) {
        console.error('Error in image search:', error);
        return NextResponse.json({ error: 'Gagal mencari gambar' }, { status: 500 });
    }
}