import { z } from "zod";

const contactSchema = z.object({
    phoneNumber: z.string().regex(/^[0-9]+$/),
    name: z.string().optional(),
    gender: z.string().optional(),
    group: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    email: z.email().optional(),
    cellPhoneNumber: z.string().optional(),
    document: z.string().optional(),
    source: z.enum(["Blip Chat", "Messenger", "Instagram", "WhatsApp"]).optional(),
    extras: z.record(z.string(), z.string()).optional()
});

export const upsertContactsSchema = z.object({
    contacts: z.array(contactSchema)
});

export type ContactSchema = z.infer<typeof contactSchema>;