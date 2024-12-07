import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';


export async function POST(request: NextRequest) {
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File;
  
      if (!file) {
        return NextResponse.json({ error: 'Tidak ada file' }, { status: 400 });
      }
  
      if (!file.name.toLowerCase().endsWith('.json')) {
        return NextResponse.json({ error: 'Hanya file JSON yang diperbolehkan' }, { status: 400 });
      }
  
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
  
      const uploadPath = path.join(process.cwd(), 'public', 'mapper.json');
  
      await fs.promises.writeFile(uploadPath, buffer);
  
      return NextResponse.json({ message: 'Upload JSON berhasil' });
  
    } catch (error) {
      console.error('Error upload:', error);
      return NextResponse.json({ error: 'Gagal upload JSON' }, { status: 500 });
    }
  }