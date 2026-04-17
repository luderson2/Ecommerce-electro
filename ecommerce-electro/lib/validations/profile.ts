import { z } from 'zod'

export const profileSchema = z.object({
  first_name: z.string().min(1, 'Prénom requis'),
  last_name: z.string().min(1, 'Nom requis'),
  phone: z.string().optional().or(z.literal('')),
  address_street: z.string().optional().or(z.literal('')),
  address_apartment: z.string().optional().or(z.literal('')),
  address_city: z.string().optional().or(z.literal('')),
  address_province: z.string().optional().or(z.literal('')),
  address_postal_code: z
    .string()
    .regex(/^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i, 'Code postal canadien invalide (ex: H2X 1Y4)')
    .optional()
    .or(z.literal('')),
  address_country: z.string().optional().or(z.literal('')),
})

export type ProfileFormData = z.infer<typeof profileSchema>
