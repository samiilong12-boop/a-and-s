import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const configFilePath = path.join(process.cwd(), 'public', 'videos', 'hero-config.json');

const defaultConfig = {
  activeVideoUrl: '/videos/campaign-hero.mp4',
  visualMode: 'video', // 'video' | 'photo'
  videoTitle: 'الفيديو الإعلاني الأصلي لبراند A AND S',
  updatedAt: new Date().toISOString(),
};

export async function GET() {
  try {
    if (fs.existsSync(configFilePath)) {
      const data = fs.readFileSync(configFilePath, 'utf-8');
      return NextResponse.json(JSON.parse(data));
    }
    return NextResponse.json(defaultConfig);
  } catch (error: any) {
    console.error('Error reading hero config:', error);
    return NextResponse.json(defaultConfig);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updatedConfig = {
      activeVideoUrl: body.activeVideoUrl || defaultConfig.activeVideoUrl,
      visualMode: body.visualMode || defaultConfig.visualMode,
      videoTitle: body.videoTitle || 'فيديو مخصص',
      updatedAt: new Date().toISOString(),
    };

    const dir = path.dirname(configFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(configFilePath, JSON.stringify(updatedConfig, null, 2), 'utf-8');

    return NextResponse.json({ success: true, config: updatedConfig });
  } catch (error: any) {
    console.error('Error updating hero config:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
