'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

const contactSchema = z.object({
  name: z.string().min(2, 'Tên cần có ít nhất 2 ký tự'),
  email: z.string().email('Vui lòng nhập email hợp lệ'),
  subject: z.string().min(5, 'Tiêu đề cần có ít nhất 5 ký tự'),
  message: z.string().min(10, 'Nội dung cần có ít nhất 10 ký tự'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Không gửi được lời nhắn');
      }

      setStatus('success');
      reset();
    } catch {
      setStatus('error');
      setErrorMessage('Không gửi được lời nhắn. Vui lòng thử lại sau.');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center py-12">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 shadow-lg shadow-emerald-600/10 dark:bg-emerald-900/30">
          <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-slate-950 dark:text-white">
          Đã gửi lời nhắn!
        </h3>
        <p className="mb-6 text-slate-600 dark:text-slate-300">
          Cảm ơn bạn đã liên hệ. Tôi sẽ phản hồi trong thời gian sớm nhất.
        </p>
        <Button onClick={() => setStatus('idle')} variant="outline">
          Gửi lời nhắn khác
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {status === 'error' && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Họ và tên
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className={cn(
              'input-modern w-full rounded-2xl px-4 py-3 placeholder-slate-400 dark:placeholder-slate-500',
              errors.name
                ? '!border-red-300 dark:!border-red-700'
                : ''
            )}
            placeholder="Nhập họ và tên"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className={cn(
              'input-modern w-full rounded-2xl px-4 py-3 placeholder-slate-400 dark:placeholder-slate-500',
              errors.email
                ? '!border-red-300 dark:!border-red-700'
                : ''
            )}
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Tiêu đề
        </label>
        <input
          id="subject"
          type="text"
          {...register('subject')}
          className={cn(
            'input-modern w-full rounded-2xl px-4 py-3 placeholder-slate-400 dark:placeholder-slate-500',
            errors.subject
              ? '!border-red-300 dark:!border-red-700'
              : ''
          )}
          placeholder="Nội dung trao đổi chính"
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-red-500">{errors.subject.message}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Nội dung
        </label>
        <textarea
          id="message"
          rows={5}
          {...register('message')}
          className={cn(
            'input-modern w-full resize-none rounded-2xl px-4 py-3 placeholder-slate-400 dark:placeholder-slate-500',
            errors.message
              ? '!border-red-300 dark:!border-red-700'
              : ''
          )}
          placeholder="Nhập nội dung lời nhắn..."
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={status === 'loading'} className="w-full sm:w-auto">
        {status === 'loading' ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Đang gửi...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Gửi lời nhắn
          </>
        )}
      </Button>
    </form>
  );
}
