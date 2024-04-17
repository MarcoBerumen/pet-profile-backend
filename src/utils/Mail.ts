import nodemailer from 'nodemailer';

export class Mail {
  transporter: nodemailer.Transporter;

  public constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'login',
        user: 'mabe007.ma@gmail.com',
        pass: 'okrn mwkl incd gjld',
      },
    });
  }

  public static sendConfirmEmailCode(email: string, code: string) {
    const mailer = new Mail();
    const mailOptions: nodemailer.SendMailOptions = {
      from: 'mabe007.ma@gmail.com',
      to: email,
      subject: 'Holaaaaaaaaa',
      text: 'Hola mi amor te quiero mucho <3 ' + code,
    };

    mailer.sendMail(mailOptions);
  }

  public sendMail(mailOptions: nodemailer.SendMailOptions): void {
    this.transporter.sendMail(mailOptions, (err, data) => {
      if (err) console.error(err);
      if (process.env.NODE_ENV === 'development')
        console.log('Email sent: ', data);
    });
  }
}
