import { z } from "zod";

export const githubCallbackSchema = z.object({
    code: z.string().min(1, "OAuth code is required"),
    installation_id: z.string().min(1, "Installation ID is required"),
});