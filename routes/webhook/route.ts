import { Request, Response } from 'express';
import crypto from 'crypto';
import { GenerateSecret } from '../../utils/generateSecret';

export const githubWebhook = async (req: Request, res: Response) => {
    const signature = req.headers['x-hub-signature-256'] as string | undefined;
    const event = req.headers['x-github-event'] as string | undefined;
    const bountyPoolAddress = req.params.bountyPool;

    const bodyraw = (req as any).rawBody;
    if (!bodyraw) {
        res.status(400).json({ error: 'Missing request body' });
        return;
    }

    const rawBody = bodyraw.toString();
    const webhookSecret = await GenerateSecret(bountyPoolAddress);

    const expectedHash = `sha256=${crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex')}`;

    const isValid =
        signature &&
        crypto.timingSafeEqual(
            Buffer.from(signature, 'utf8'),
            Buffer.from(expectedHash, 'utf8')
        );

    if (!isValid) {
        res.status(403).json({ error: 'Invalid signature' });
        return;
    }

    const payload = req.body;
    let responsePayload: any = { event };

    switch (event) {
        case 'pull_request': {
            const pr = payload.pull_request;
            const isMerged = payload.action === 'closed' && pr.merged === true;

            if (isMerged) {
                responsePayload = {
                    event,
                    type: 'merged',
                    pr_title: pr.title,
                    pr_url: pr.html_url,
                    pr_author: pr.user?.login,
                    repo: payload.repository?.full_name,
                };
            } else {
                responsePayload = {
                    event,
                    type: payload.action,
                    pr_title: pr.title,
                    pr_url: pr.html_url,
                    pr_author: pr.user?.login,
                    repo: payload.repository?.full_name,
                };
            }
            break;
        }

        case 'ping': {
            responsePayload = {
                ...responsePayload,
                msg: 'Ping event received',
                hook_id: payload.hook_id,
                repo: payload.repository?.full_name,
            };
            break;
        }

        default: {
            responsePayload = {
                ...responsePayload,
                msg: 'Unhandled event type',
                fullPayload: payload,
            };
        }
    }

    res.status(200).json(responsePayload);
};
