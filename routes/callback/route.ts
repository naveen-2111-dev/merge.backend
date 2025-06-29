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

    const { code, installation_id } = result.data;

    res.cookie("github_id", installation_id, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
        message: "GitHub ID set in cookie",
        status: true,
        installation_id,
        code,
    });
};
