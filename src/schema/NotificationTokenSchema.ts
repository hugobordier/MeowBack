import { z } from 'zod';

export const notificationTokenSchema = z.object({
  expo_push_token: z
    .string()
    .min(1, { message: 'Le token ne peut pas être vide' })
    .regex(/^ExponentPushToken\[[A-Za-z0-9_-]+\]$/, { message: 'Format du token invalide' }),
});
