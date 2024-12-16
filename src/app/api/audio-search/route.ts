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
        const audio = formData.get('audio') as File;

        if (!audio) {
            console.log('No audio uploaded');
            return NextResponse.json({ error: 'Tidak ada audio yang diunggah' }, { status: 400 });
        }

        console.log('audio received:', audio.name);

        // Simpan gambar sementara
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'temp');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        // rename audio name to query.mid
        const audioPath = path.join(uploadDir, 'query.mid');
        const audioBuffer = await audio.arrayBuffer();
        fs.writeFileSync(audioPath, Buffer.from(audioBuffer));

        console.log('audio saved temporarily at:', audioPath);

        // Direktori gambar untuk pencarian
        // const audioDirectory = path.join(process.cwd(), 'public', 'uploads', 'audio');

        // Jalankan skrip Python untuk pencarian gambar
        const pythonScriptPath = path.join(process.cwd(), 'src', 'app', 'api', 'audio-retrieval', 'audioSearching.py');
        const command = `python "${pythonScriptPath}" "${audioPath}"`;

        console.log('Executing Python script with command:', command);

        const { stdout, stderr } = await execPromise(command);

        // Hapus gambar sementara
        // fs.unlinkSync(imagePath);
        fs.unlink(audioPath, (error) => {
            if (error) {
                console.error('Error deleting temporary audio:', error);
            } else {
                console.log('Temporary audio deleted:', audioPath);
            }
        });

        // console.log('Python script output:', stdout);

        // Cek jika ada error saat menjalankan skrip Python

        if (stderr) {
            console.error('Error executing Python script:', stderr);
            return NextResponse.json({ error: 'Gagal mencari audio' }, { status: 500 });
        }

        // Parse output dari Python script sebagai JSON
        const similaraudios = JSON.parse(stdout.trim());
        console.log('Similar audios found:', similaraudios);
        
        return NextResponse.json({ 
            message: 'Pencarian audio berhasil', 
            similaraudios 
        });
    } catch (error) {
        console.error('Error in audio search:', error);
        return NextResponse.json({ error: 'Gagal mencari audio' }, { status: 500 });
    }
}