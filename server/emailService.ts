/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * IGNOU BCA Major Project BCSP-064
 * Project Title: AI-Driven IT Service Desk and Automated Ticket Triage System
 * Email Notification Service (Algorithm 3)
 * 
 * Triggers actual resolution emails to the customer when a ticket is resolved.
 * Operates with live SMTP when credentials exist (via SMTP_HOST), and maintains a real-time
 * in-memory dispatch queue for development/demo verification.
 */

import net from 'net';
import tls from 'tls';

export interface SentEmail {
  id: string;
  ticket_id: number;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  html_content: string;
  sent_at: string;
  delivery_status: 'DELIVERED_DEV_QUEUE' | 'SENT_SMTP' | 'FAILED';
  error_details?: string;
}

class EmailNotificationService {
  private emailQueue: SentEmail[] = [];

  /**
   * Raw SMTP transport socket implementation using Node's built-in net/tls.
   */
  private async dispatchViaSMTP(params: {
    to: string;
    from: string;
    subject: string;
    html: string;
  }): Promise<boolean> {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER || '';
    const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '';

    if (!host) return false;

    return new Promise((resolve) => {
      try {
        const isTls = port === 465;
        const socket = isTls
          ? tls.connect({ host, port, rejectUnauthorized: false })
          : net.connect({ host, port });

        let step = 0;
        socket.setEncoding('utf8');
        socket.setTimeout(5000);

        socket.on('data', (data) => {
          const response = data.toString();

          if (step === 0 && response.startsWith('220')) {
            step = 1;
            socket.write(`EHLO localhost\r\n`);
          } else if (step === 1 && response.startsWith('250')) {
            if (user && pass) {
              step = 2;
              socket.write(`AUTH LOGIN\r\n`);
            } else {
              step = 5;
              socket.write(`MAIL FROM:<${params.from}>\r\n`);
            }
          } else if (step === 2 && response.startsWith('334')) {
            step = 3;
            socket.write(Buffer.from(user).toString('base64') + '\r\n');
          } else if (step === 3 && response.startsWith('334')) {
            step = 4;
            socket.write(Buffer.from(pass).toString('base64') + '\r\n');
          } else if (step === 4 && (response.startsWith('235') || response.startsWith('250'))) {
            step = 5;
            socket.write(`MAIL FROM:<${params.from}>\r\n`);
          } else if (step === 5 && response.startsWith('250')) {
            step = 6;
            socket.write(`RCPT TO:<${params.to}>\r\n`);
          } else if (step === 6 && response.startsWith('250')) {
            step = 7;
            socket.write(`DATA\r\n`);
          } else if (step === 7 && response.startsWith('354')) {
            step = 8;
            const mime = [
              `From: ${params.from}`,
              `To: ${params.to}`,
              `Subject: ${params.subject}`,
              `MIME-Version: 1.0`,
              `Content-Type: text/html; charset=utf-8`,
              ``,
              params.html,
              `.`,
            ].join('\r\n');
            socket.write(mime + '\r\n');
          } else if (step === 8 && response.startsWith('250')) {
            step = 9;
            socket.write(`QUIT\r\n`);
            socket.end();
            resolve(true);
          }
        });

        socket.on('error', (err) => {
          console.error(`[SMTP Transport Error]: ${err.message}`);
          resolve(false);
        });

        socket.on('timeout', () => {
          console.error('[SMTP Transport Timeout]: Connection timed out after 5s');
          socket.destroy();
          resolve(false);
        });
      } catch (err: any) {
        console.error(`[SMTP Connection Exception]: ${err.message}`);
        resolve(false);
      }
    });
  }

  /**
   * Dispatches resolution notification to the customer.
   */
  public async sendResolutionNotification(params: {
    ticket_id: number;
    title: string;
    customer_name: string;
    customer_email: string;
    department_name: string;
    resolution_solution: string;
    resolved_by_agent: string;
  }): Promise<SentEmail> {
    const subject = `[Ticket #${params.ticket_id} Resolved] ${params.title}`;
    const smtpFrom = process.env.SMTP_FROM || 'IT Service Desk <notifications@servicedesk.org>';

    const html_content = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2563eb; color: #ffffff; padding: 20px;">
          <h2 style="margin: 0; font-size: 20px;">IT Service Desk - Ticket Resolution Notice</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">IGNOU BCSP-064 Automated Support Desk</p>
        </div>
        <div style="padding: 24px;">
          <p>Dear <strong>${params.customer_name}</strong>,</p>
          <p>Your support ticket <strong>#${params.ticket_id}</strong> regarding <em>"${params.title}"</em> has been successfully evaluated and marked as <strong>Resolved</strong> by our IT Support Desk.</p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; font-weight: bold; color: #0f766e;">Assigned Department: ${params.department_name}</p>
            <p style="margin: 0 0 8px 0; font-weight: bold; color: #0f766e;">Resolved By Support Agent: ${params.resolved_by_agent}</p>
            <p style="margin: 0; font-weight: bold; color: #1e293b;">Resolution Notes & Diagnostics:</p>
            <p style="margin: 8px 0 0 0; color: #334155;">${params.resolution_solution || 'Standard resolution procedure completed successfully.'}</p>
          </div>

          <p>If you still experience issues related to this request, you may log in to the student/faculty portal to submit a new inquiry.</p>
          <p style="margin-top: 24px; color: #64748b; font-size: 13px;">Automated notification generated by AI-Driven IT Service Desk & Automated Ticket Triage System.</p>
        </div>
      </div>
    `;

    let status: 'DELIVERED_DEV_QUEUE' | 'SENT_SMTP' | 'FAILED' = 'DELIVERED_DEV_QUEUE';
    let error_details: string | undefined = undefined;

    // Check if live SMTP configuration is active
    if (process.env.SMTP_HOST) {
      console.log(`[SMTP] Attempting live email dispatch to ${params.customer_email} via ${process.env.SMTP_HOST}...`);
      const sent = await this.dispatchViaSMTP({
        to: params.customer_email,
        from: smtpFrom,
        subject,
        html: html_content,
      });

      if (sent) {
        status = 'SENT_SMTP';
        console.log(`[SMTP Success] Email delivered to ${params.customer_email}`);
      } else {
        status = 'FAILED';
        error_details = `Failed to connect/authenticate with SMTP server ${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 587}`;
        console.error(`[SMTP Warning] Real SMTP delivery failed. Storing in outbox log as FAILED.`);
      }
    } else {
      console.log(`[Email Notification] SMTP_HOST unconfigured. Dispatching to Safe Dev Outbox for ${params.customer_email}`);
    }

    const emailRecord: SentEmail = {
      id: 'email_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      ticket_id: params.ticket_id,
      recipient_email: params.customer_email,
      recipient_name: params.customer_name,
      subject,
      html_content,
      sent_at: new Date().toISOString(),
      delivery_status: status,
      error_details,
    };

    this.emailQueue.unshift(emailRecord);

    return emailRecord;
  }

  public getRecentEmails(): SentEmail[] {
    return [...this.emailQueue];
  }
}

export const emailService = new EmailNotificationService();
