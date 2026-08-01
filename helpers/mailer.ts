import nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";

export const sendMail = async ({
    email,
    emailType,
    userId
}: {
    email: string;
    emailType: "VERIFY" | "RESET";
    userId: any;
}) => {
    try {
        const TOKEN = process.env.MAILTRAP_TOKEN;

        if (!TOKEN) {
            throw new Error("MAILTRAP_TOKEN is not defined");
        }

        const transport = nodemailer.createTransport(
            MailtrapTransport({
                token: TOKEN,
            })
        );

        const subject =
            emailType === "VERIFY"
                ? "Verify your Email"
                : "Reset your Password";

        const html =
            emailType === "VERIFY"
                ? `
                    <h2>Verify your Email</h2>
                    <p>Thanks for signing up.</p>
                    <p>Please verify your email address.</p>
                  `
                : `
                    <h2>Reset your Password</h2>
                    <p>Click the link below to reset your password.</p>
                  `;

        const mailResponse = await transport.sendMail({
            from: {
                address: "hello@demomailtrap.co",
                name: "JobSearch AI",
            },
            to: email,
            subject,
            html,
        });

        return mailResponse;
    } catch (error: any) {
        throw new Error(error.message);
    }
};