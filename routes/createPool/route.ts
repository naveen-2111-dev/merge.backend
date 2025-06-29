import { Request, Response } from "express";
import { GenerateSecret } from "../../utils/generateSecret";
import { createBountyPoolSchema } from "../../utils/validator/createBounty";

export const createBountyPool = async (req: Request, res: Response) => {
    const result = createBountyPoolSchema.safeParse(req.body);

    if (!result.success) {
        res.status(400).json({
            error: "Invalid input",
            details: result.error.format(),
        });
        return;
    }

    const { bountyPoolAddress } = result.data;

    const webhookSecret = await GenerateSecret(bountyPoolAddress);

    res.status(200).json({
        bountyPool: bountyPoolAddress,
        webhookUrl: `https://merge-backend.vercel.app/webhook/${bountyPoolAddress}`,
        webhookSecret,
    });
    return;
};
