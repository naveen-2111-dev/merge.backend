import crypto from 'crypto';

export async function GenerateSecret(pool: string) {
    return crypto.createHmac("sha256", process.env.MASTER_SECRET!)
        .update(pool)
        .digest("hex");
}