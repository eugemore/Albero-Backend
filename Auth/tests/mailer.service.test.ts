import { describe, expect, test, jest, afterEach } from '@jest/globals';
import nodeMailer from "nodemailer";
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import MailerService from '../src/utils/services/mailer.service';

// jest.mock('nodemailer');
describe('Mailer Service', () => {
  test('send Mail', () => {
    //Arrange
    let mailContent: any;
    const transport: Partial<nodeMailer.Transporter<SMTPTransport.SentMessageInfo>> = {
      sendMail: jest.fn(async (value) => {
        mailContent = value
        return value
      })
    };
    const transportSpy = jest.spyOn(nodeMailer, 'createTransport')
    transportSpy.mockReturnValue(transport as nodeMailer.Transporter<SMTPTransport.SentMessageInfo>)
    const email = 'mail@mail.com';
    const code = '123';
    const link =  'http://localhost:5001/verify?user=123&email=mail@mail.com'
    //Act

    MailerService.sendEmail(code, email);
    //Assert

    expect(transportSpy).toBeCalled();
    expect(mailContent.to).toEqual(`<${email}>`);
    expect(mailContent.html).toEqual(`<html><b> ${link} </b></html>`);
  })

})