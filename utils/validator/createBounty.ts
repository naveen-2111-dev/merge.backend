import { z } from "zod";

export const createBountyPoolSchema = z.object({
    bountyPoolAddress: z
        .string()
        .startsWith("0x")
        .length(42, "Invalid Ethereum address")
});
