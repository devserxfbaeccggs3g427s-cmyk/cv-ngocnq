import { NextRequest, NextResponse } from 'next/server';
import { profile } from '@/data/profile';

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ContactPayload;
    const { name, email, subject, message } = body;

    // Validate required fields
    if (
      !isNonEmptyString(name) ||
      !isNonEmptyString(email) ||
      !isNonEmptyString(subject) ||
      !isNonEmptyString(message)
    ) {
      return NextResponse.json(
        { error: 'Vui lòng nhập đầy đủ thông tin' },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.CONTACT_EMAIL_FROM;
    const to = process.env.CONTACT_EMAIL_TO ?? profile.email;

    if (!apiKey || !from) {
      console.error('Contact form email is not configured. Missing RESEND_API_KEY or CONTACT_EMAIL_FROM.');
      return NextResponse.json(
        { error: 'Chưa cấu hình dịch vụ gửi email' },
        { status: 500 }
      );
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    const emailSubject = `[CV Contact] ${trimmedSubject}`;
    const text = [
      'Bạn có lời nhắn mới từ website CV.',
      '',
      `Họ và tên: ${trimmedName}`,
      `Email: ${trimmedEmail}`,
      `Tiêu đề: ${trimmedSubject}`,
      '',
      'Nội dung:',
      trimmedMessage,
    ].join('\n');

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2 style="margin: 0 0 16px;">Bạn có lời nhắn mới từ website CV</h2>
        <p><strong>Họ và tên:</strong> ${escapeHtml(trimmedName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(trimmedEmail)}</p>
        <p><strong>Tiêu đề:</strong> ${escapeHtml(trimmedSubject)}</p>
        <div style="margin-top: 16px;">
          <strong>Nội dung:</strong>
          <p style="white-space: pre-wrap;">${escapeHtml(trimmedMessage)}</p>
        </div>
      </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: trimmedEmail,
        subject: emailSubject,
        text,
        html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Contact form email failed:', errorBody);
      return NextResponse.json(
        { error: 'Không gửi được email' },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Lời nhắn đã được gửi thành công' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Không xử lý được yêu cầu' },
      { status: 500 }
    );
  }
}
