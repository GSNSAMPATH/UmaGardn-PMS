// using System.Net;
// using System.Net.Mail;
// using System.Threading.Tasks;

// public class EmailService
// {
//     private readonly SmtpClient _client;
//     private readonly string _from;

//     public EmailService(string host, int port, string from, string username, string password)
//     {
//         _from = from;
//         _client = new SmtpClient(host, port)
//         {
//             Credentials = new NetworkCredential(username, password),
//             EnableSsl = true
//         };
//     }

//     public async Task SendEmailAsync(string to, string subject, string body)
//     {
//         var mail = new MailMessage(_from, to, subject, body)
//         {
//             IsBodyHtml = true
//         };
//         await _client.SendMailAsync(mail);
//     }
// }

using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using System.Collections.Generic;

public class EmailService
{
    private readonly SmtpClient _client;
    private readonly string _from;

    public EmailService(string host, int port, string from, string username, string password)
    {
        _from = from;
        _client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(username, password),
            EnableSsl = true
        };
    }

    // ✅ Send email with optional attachments
    public async Task SendEmailAsync(string to, string subject, string body, List<(string FileName, byte[] Content, string ContentType)>? attachments = null)
    {
        var mail = new MailMessage(_from, to, subject, body)
        {
            IsBodyHtml = true
        };

        if (attachments != null)
        {
            foreach (var att in attachments)
            {
                var stream = new System.IO.MemoryStream(att.Content);
                var attachment = new Attachment(stream, att.FileName, att.ContentType);
                mail.Attachments.Add(attachment);
            }
        }

        await _client.SendMailAsync(mail);
    }
}