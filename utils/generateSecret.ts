import crypto from 'crypto';

export async function GenerateSecret(pool: string) {
    //generates webhook secret
    return crypto.createHmac("sha256", process.env.MASTER_SECRET!)
        .update(pool)
        .digest("hex");
}