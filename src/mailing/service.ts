import nodemailer from 'nodemailer';

// async..await is not allowed in global scope, must use a wrapper
async function mailingService(
  subject: string,
  template: string,
  receiver: string,
): Promise<void> {
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: 'mail.privateemail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.email,
      pass: process.env.password,
    },
  });

  // send mail with defined transport object
  await transporter.sendMail({
    from: `Bookry Club ${process.env.email}`, // sender address
    to: receiver, // list of receivers
    subject,
    html: template, // html body
  });
}

export default mailingService;
