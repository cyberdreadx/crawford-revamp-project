import { z } from 'zod';

// Authentication validation schemas
export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: 'Please enter a valid email address' })
    .max(255, { message: 'Email must be less than 255 characters' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(128, { message: 'Password must be less than 128 characters' })
});

export const signUpSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: 'Please enter a valid email address' })
    .max(255, { message: 'Email must be less than 255 characters' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(128, { message: 'Password must be less than 128 characters' })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      { message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' }
    ),
  firstName: z
    .string()
    .trim()
    .max(100, { message: 'First name must be less than 100 characters' })
    .optional(),
  lastName: z
    .string()
    .trim()
    .max(100, { message: 'Last name must be less than 100 characters' })
    .optional()
});

// Contact form validation schema
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'Name is required' })
    .max(100, { message: 'Name must be less than 100 characters' }),
  email: z
    .string()
    .trim()
    .email({ message: 'Please enter a valid email address' })
    .max(255, { message: 'Email must be less than 255 characters' }),
  phone: z
    .string()
    .trim()
    .max(20, { message: 'Phone number must be less than 20 characters' })
    .regex(/^[\d\s\-\(\)\+]*$/, { message: 'Please enter a valid phone number' })
    .optional()
    .or(z.literal('')),
  message: z
    .string()
    .trim()
    .min(1, { message: 'Message is required' })
    .max(2000, { message: 'Message must be less than 2000 characters' })
});

export type SignInForm = z.infer<typeof signInSchema>;
export type SignUpForm = z.infer<typeof signUpSchema>;
export type ContactForm = z.infer<typeof contactSchema>;
