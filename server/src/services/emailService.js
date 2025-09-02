import nodemailer from "nodemailer";

export const sendEmail = async (from, to, password, subject, htmlContent, service = "gmail") => {
  const transporter = nodemailer.createTransport({
    service,
    auth: {
      user: from,
      pass: password,
    },
  });

  const mailOptions = { from, to, subject, html: htmlContent };
  setImmediate(async () => await transporter.sendMail(mailOptions));
};
