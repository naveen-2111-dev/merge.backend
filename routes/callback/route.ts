import { Request, Response } from "express";
import { githubCallbackSchema } from "../../utils/validator/githubCallback";

export const githubCallback = async (req: Request, res: Response): Promise<void> => {
    const result = githubCallbackSchema.safeParse(req.query);

    if (!result.success) {
        res.status(400).json({
            error: "Invalid input",
            status: false,
            details: result.error.format(),
        });
        return;
    }

    const { installation_id } = result.data;

    res.redirect(`https://mergeprotocol.vercel.app/pools?installation_id=${installation_id}`);
};
