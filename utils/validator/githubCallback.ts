import { z } from "zod";

export const githubCallbackSchema = z.object({
    githubId: z.string().min(1, "GitHub ID is required"),
});