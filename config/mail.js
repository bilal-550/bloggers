const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = async function (options) {
  if (options.from == null) {
    options.from = `Bloggers <${process.env.MAIL_FROM}>`
  }
  try {
    await sgMail.send(options)
    return true;
  } catch (err) {
    console.error(err);
    throw err;
  }

}