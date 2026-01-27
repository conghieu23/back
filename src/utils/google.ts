import {OAuth2Client} from "google-auth-library";
import {env} from "../config/env";

const client = new OAuth2Client({
    client_id: env.google_client_id,
    client_secret: env.google_client_secret
});

export async function verify(idToken: string) {
    const verified = await client.verifyIdToken({
        idToken,
        audience: env.google_client_id
    });

    const payload = verified.getPayload();
    return payload;
}

export default verify;