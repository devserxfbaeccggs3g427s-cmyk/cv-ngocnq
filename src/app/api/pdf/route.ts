import { NextRequest, NextResponse } from 'next/server';
import { profile } from '@/data/profile';

export async function GET(request: NextRequest) {
  // For now, redirect to the print page
  // In production, you could integrate with a PDF service or use puppeteer
  
  // Option 1: Redirect to print page with auto-print
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
  
  // Return JSON with instructions for downloading PDF
  return NextResponse.json({
    message: 'Tạo file PDF',
    instructions: [
      '1. Mở bản CV tối ưu cho in ấn',
      '2. Dùng chức năng In của trình duyệt (Ctrl/Cmd + P)',
      '3. Chọn đích là "Lưu dưới dạng PDF"',
      '4. Bấm Lưu để tải file CV PDF',
    ],
    printUrl: `${baseUrl}/print`,
    filename: `${profile.name.replace(/\s+/g, '_')}_CV.pdf`,
  });
}
