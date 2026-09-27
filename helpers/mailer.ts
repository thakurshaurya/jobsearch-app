import nodemailer from "nodemailer";


export const sendMail = async ({
    email,
    emailType,
    userId,
    token,
}: {
    email: string;
    emailType: "VERIFY" | "RESET";
    userId?: any;
    token?: string;
}) => {
    try {
        const TOKEN = process.env.MAILTRAP_TOKEN;
        const domain = process.env.DOMAIN || "http://localhost:3000";

        const actionUrl =
            emailType === "VERIFY"
                ? `${domain}/verify-email?token=${token || ""}`
                : `${domain}/reset-password?token=${token || ""}`;

        console.log(`[AUTH EMAIL] Generating ${emailType} email for ${email}`);
        console.log(`[AUTH EMAIL LINK]: ${actionUrl}`);

        const subject =
            emailType === "VERIFY"
                ? "Verify your Email - JobHunt AI"
                : "Reset your Password - JobHunt AI";

        const html =
            emailType === "VERIFY"
                ? `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 12px; background-color: #ffffff;">
                        <h2 style="color: #0284c7; margin-bottom: 16px;">Verify your Email</h2>
                        <p style="color: #334155; font-size: 16px; line-height: 1.5;">Thanks for signing up for JobHunt AI! Please confirm your email address to continue.</p>
                        <div style="margin: 28px 0;">
                            <a href="${actionUrl}" style="background-color: #0284c7; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Verify Email Address</a>
                        </div>
                        <p style="color: #64748b; font-size: 14px;">Or copy and paste this URL into your browser:</p>
                        <p style="color: #0284c7; font-size: 13px; word-break: break-all;">${actionUrl}</p>
                    </div>
                  `
                : `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                        <div style="text-align: center; margin-bottom: 24px;">
                            <h1 style="color: #0ea5e9; font-size: 24px; margin: 0;">JobHunt AI</h1>
                            <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Smart Job Matching Platform</p>
                        </div>
                        <h2 style="color: #0f172a; font-size: 20px; margin-bottom: 12px;">Reset Your Password</h2>
                        <p style="color: #334155; font-size: 15px; line-height: 1.6;">We received a request to reset your password. Click the button below to choose a new password.</p>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${actionUrl}" style="background-color: #3b82f6; color: #ffffff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">Reset Password</a>
                        </div>
                        <p style="color: #64748b; font-size: 14px; line-height: 1.5;">This link will expire in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                        <p style="color: #94a3b8; font-size: 12px; line-height: 1.4;">If the button above doesn't work, copy and paste this URL into your browser:<br/>
                            <a href="${actionUrl}" style="color: #3b82f6; word-break: break-all;">${actionUrl}</a>
                        </p>
                    </div>
                  `;

        if (!TOKEN) {
            console.warn("MAILTRAP_TOKEN not configured. Reset link was logged to console.");
            return { messageId: "dev-mock-id", previewUrl: actionUrl };
        }

        try {
            const transport = nodemailer.createTransport(
                // MailtrapTransport({
                //     token: TOKEN,
                // })
            );

            const mailResponse = await transport.sendMail({
                from: {
                    address: "hello@demomailtrap.co",
                    name: "JobHunt AI",
                },
                to: email,
                subject,
                html,
            });

            return mailResponse;
        } catch (mailError: any) {
            console.warn("Mail delivery error (fallback logged to console):", mailError?.message || mailError);
            // Even if Mailtrap rejects in test/unverified domain mode, we return the actionUrl for dev reliability
            return {
                messageId: "dev-fallback",
                previewUrl: actionUrl,
                error: mailError?.message,
            };
        }
    } catch (error: any) {
        console.error("sendMail fatal error:", error);
        throw new Error(error.message);
    }
};