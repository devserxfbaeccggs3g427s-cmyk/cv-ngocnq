export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateEnvAiPassword(confirmPassword: unknown) {
  const expectedPassword = process.env.AI_ENV_CONFIRM_PASSWORD?.trim() ?? '';

  if (!expectedPassword) {
    return {
      message: 'Chưa cấu hình AI_ENV_CONFIRM_PASSWORD trong env.',
      status: 500,
    };
  }

  if (!isNonEmptyString(confirmPassword) || confirmPassword.trim() !== expectedPassword) {
    return {
      message: 'Mật khẩu xác nhận AI không đúng.',
      status: 403,
    };
  }

  return null;
}
