import {env} from "../config/env";

const endpoint = {
    callback: 'https://rihanna-unrivaled-karan.ngrok-free.dev/invoice/callback',
}
export async function createInvoice(ref: string, amount: number) {
    const params =
        `merchant_id=${env.fpayment_merchant_id}` +
        `&api_key=${env.fpayment_secret}` +
        `&amount=${amount}` +
        `&request_id=${ref}` +
        `&name=create%20invoice` +
        `&description=kinhngu` +
        `&callback_url=${encodeURIComponent(endpoint.callback)}` +
        `&success_url=` +
        `&cancel_url=`;

    const url = `https://app.fpayment.net/api/AddInvoice?${params}`;

    const resp = await fetch(url, {
        method: "POST",
    });
    return await resp.json();
}

export async function callback(body: any) {
    let success = false;
    let ref: string = '';
    if (body) {
        if (body.merchant_id == env.fpayment_merchant_id
            && body.api_key == env.fpayment_secret) {
            ref = body.request_id;
            success = body.status == 'completed';
        }
    }
    return {
        reference: ref,
        success: success,
    }
}
