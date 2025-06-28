import { Request, Response } from 'express';
import crypto from 'crypto';
import { GenerateSecret } from '../../utils/generateSecret';

export const githubWebhook = async (req: Request, res: Response) => {
    const signature = req.headers['x-hub-signature-256'] as string | undefined;
    const event = req.headers['x-github-event'] as string | undefined;
    const bountyPoolAddress = req.params.bountyPool;

    const bodyraw = (req as any).rawBody;
    if (!bodyraw) {
        console.error('Raw body is missing');
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
        console.warn('Invalid signature');
        res.status(403).json({ error: 'Invalid signature' });
        return;
    }

    const payload = req.body;
    let responsePayload: any = { event };

    console.log(responsePayload);

    switch (event) {
        case 'pull_request': {
            const pr = payload.pull_request;
            const isMerged = payload.action === 'closed' && pr.merged === true;

            if (isMerged) {
                console.log('✅ PR Merged!');
                console.log(`🔗 PR URL: ${pr.html_url}`);
                console.log(`📝 Title: ${pr.title}`);
                console.log(`👤 Author: ${pr.user?.login}`);
                console.log(`📦 Repo: ${payload.repository?.full_name}`);

                responsePayload = {
                    event,
                    type: 'merged',
                    pr_title: pr.title,
                    pr_url: pr.html_url,
                    pr_author: pr.user?.login,
                    repo: payload.repository?.full_name,
                };
            } else {
                console.log(`📬 Pull request event: ${payload.action}`);
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

        case 'push': {
            const isMergePush =
                payload.commits?.every((c: any) =>
                    c.message.startsWith('Merge pull request')
                );

            if (isMergePush) {
                console.log('ℹ️ Skipping merge commit push');
                break;
            }

            responsePayload = {
                ...responsePayload,
                ref: payload.ref,
                before: payload.before,
                after: payload.after,
                pusher: payload.pusher?.name,
                repo: payload.repository?.full_name,
                commits: payload.commits?.map((c: any) => ({
                    message: c.message,
                    url: c.url,
                    author: c.author?.name,
                })),
            };

            console.log(`🚀 Push Event`);
            console.log(`📦 Repo: ${payload.repository?.full_name}`);
            console.log(`👤 Pusher: ${payload.pusher?.name}`);
            console.log(`🔁 Ref: ${payload.ref}`);
            console.log(`🔨 Commits:`);
            payload.commits?.forEach((commit: any, i: number) => {
                console.log(`  #${i + 1} ✍️ ${commit.author.name}`);
                console.log(`     📜 ${commit.message}`);
                console.log(`     🔗 ${commit.url}`);
            });
            break;
        }

        case 'issues': {
            const issue = payload.issue;
            responsePayload = {
                ...responsePayload,
                action: payload.action,
                issue_title: issue.title,
                issue_url: issue.html_url,
                issue_user: issue.user?.login,
                repo: payload.repository?.full_name,
            };

            console.log(`🐞 Issue Event`);
            console.log(`📦 Repo: ${payload.repository?.full_name}`);
            console.log(`📝 Title: ${issue.title}`);
            console.log(`👤 Opened by: ${issue.user?.login}`);
            console.log(`🔗 URL: ${issue.html_url}`);
            break;
        }

        case 'ping': {
            responsePayload = {
                ...responsePayload,
                msg: 'Ping event received',
                hook_id: payload.hook_id,
                repo: payload.repository?.full_name,
            };
            console.log('📡 Ping event received');
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

    res.status(200).json({ status: 'Webhook received securely' });
    return;
};
