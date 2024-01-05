// import nodemailer from 'nodemailer';
import sgMail from "@sendgrid/mail";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const AvailableTemplates = {
  RESET_PASSWORD: "forgot_password",
  REGISTERED_USER: "registration",
  ADD_USER: "addUser",
};

class Email {
  constructor() {
    this.body = "";
    this.subject = "";
    this.link = ""
  }
  /**
   * SET TEMPLATE
   */
  /**
   *
   * @method setTemplate - set template for email sending
   * @arguments  templateName name of Template
   * @arguments  replaceObject objects that replaced in template
   */

  setSubject(subject) {
    this.subject = subject;
  }
 
  setBody(body) {
    this.body = body;
  }

  setLink(link) {
    this.link = link;
  }

  setTemplate(templateName, replaceObject = {}) {
    if (!this.subject) {
      switch (templateName) {
        case AvailableTemplates.RESET_PASSWORD:
          this.subject = "forgot_password";
          break;
        case AvailableTemplates.REGISTERED_USER:
          this.subject = "Registration";
          break;
        case AvailableTemplates.ADD_USER:
          this.subject = "addUser";
          break;
        default:
          break;
      }
    }
    // const header = fs.readFileSync(
    //   path.join(__dirname, '..', 'templates', 'forgot_template.html'),
    //   'utf8'
    // );

    // const footer = fs.readFileSync(
    //   path.join(__dirname, '..', 'templates', 'footer.hbs'),
    //   'utf8'
    // );
    if (!this.body) {
      const content = fs.readFileSync(
        path.join(__dirname, "..", "email_template", `${templateName}.html`),
        "utf8"
      );

      const template = Handlebars.compile(content);
      this.body = template(replaceObject);
      console.log(this.body,"thisbodythisbody........");
    }
    this.link = replaceObject
    console.log(this.body,"......",this.link);
    return this.link;
  }

  /**
   * SET SUBJECT
   */
  /**
   * @method setSubject - set Subject for email sending
   * @arguments  subject subject of email to be send
   */
  // setSubject(subject) {
  //   this.subject = subject;
  // }

  /**
   * SET BODY
   */
  /**
   * @method setBody - set Body for email sending
   * @arguments  body body of content to send email
   * @arguments  replaceObject objects that replaced in body
   */

  // setBody(body) {
  //   this.body = body;
  // }
  /**
   * SET CC
   */ replaceObject;
  /**
   * @method setCC - set CC for email sending
   * @arguments  CC cc of email to be send
   */

  // setCC(cc) {
  //   this.cc = cc;
  // }

  /**
   * SEND EMAIL
   */
  /**
 *
 * @method sendEmail - Method for email sending
 * @arguments  html body of email
 * @arguments  subject subject of email
 * @arguments  to email address of receiver
 * @arguments  from email address of sender
 * @arguments  cc carbon copy of mail
 * @arguments  attachments attached file with mail
*/

  async sendEmail(email) {
    if (!email) {
      throw new Error("Please providreplaceObjecte email.");
    }
    const mailOption = {
      to: email,
      from: "developer@linkscart.com",
      subject: 'Sending with Twilio SendGrid is Fun',
      templateId: "d-968b9801dbbb47fd8ed1758ce65d0e1b",
      dynamicTemplateData: {
        		link: this.link.link,
        	},
    };
    console.log(mailOption,"mmmmmmmmm");
    return await sgMail.send(mailOption).then((result)=>{
      console.log(result);
    }).catch((error)=>{
      console.log(error);
    });
  }
}

export default { Email, AvailableTemplates };
