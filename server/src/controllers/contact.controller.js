const { sendResponse, AppError, catchAsync } = require("../helpers/utils");
const nodemailer = require("nodemailer");

// contact us form
const contactController = {};

contactController.sendContact = catchAsync(async (req, res, next) => {
  // get data from requests
  const { name, email, story } = req.body;

  // process
  // account ?
  nodemailer.createTestAccount((err, account) => {
    if (err) {
      console.error("Failed to create a testing account. " + err.message);
      return process.exit(1);
    }

    console.log("Credentials obtained, sending message...");

    // Create a SMTP transporter object
    let transporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });

    // Message object, content of the contact form
    let message = {
      subject: `Contact from website of ${name}`,
      from: `${name} ${email}`,
      to: "myrtice.turner@ethereal.email, thuphan273@gmail.com", // , thuphan273@gmail.com ?
      text: `${story}`, // Plaintext
      html: `<p>${story}</p>`, // HTML
      replyTo: "thuphan273@gmail.com", // ?
    };

    //
    transporter.sendMail(message, (err, info) => {
      if (err) {
        console.log("Error occurred. " + err.message);
        return process.exit(1);
      }

      console.log("Message sent: %s", info.messageId);
      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    });

    // response
    return sendResponse(res, 200, true, null, "Send contact successfully");
  });
});

module.exports = contactController;
