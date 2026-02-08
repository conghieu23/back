import nodemailer, {Transport, Transporter} from "nodemailer";
import {env} from "../config/env";

const tran: Transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: env.gmail_user,
        pass: env.gmail_app,
    }
})

export async function send(
    to: string,
    subject: string,
    text: string,
) {
    return await tran.sendMail({
        from: to,
        to: to,
        subject: subject,
        text: text,
    })

}