//src/app/api/audio-files/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    try {
        if (!pathname.includes('/api/audio-files')) {
            return NextResponse.json({ error: 'Invalid route' }, { status: 404 });
        }

        const directory = path.join(process.cwd(), 'public', 'uploads', 'audio');

        // Baca file dari direktori
        const files = await fs.promises.readdir(directory);

        // Filter hanya file (bukan direktori)
        const fileDetails = await Promise.all(
            files.map(async (filename) => {
                const fullPath = path.join(directory, filename);
                const stats = await fs.promises.stat(fullPath);
                
                return {
                    name: filename,
                    path: fullPath,
                    size: stats.size
                };
            })
        );

        return NextResponse.json({ 
            files: fileDetails,
            total: fileDetails.length
        });

    } catch (error) {
        console.error('Error reading files:', error);
        return NextResponse.json({ 
            error: 'Gagal membaca file' 
        }, { status: 500 });
    }
}
