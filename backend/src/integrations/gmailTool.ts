import { OAuthManager } from './oauthManager.js';
import { z } from 'zod';

export const GmailTool = {
  list_emails: {
    name: 'gmail_list_emails',
    description: 'Lists recent emails from the inbox.',
    schema: z.object({
      maxResults: z.number().optional().default(5),
    }),
    execute: async ({ maxResults }: { maxResults?: number }, userId: string) => {
      const accessToken = await OAuthManager.getValidAccessToken(userId);
      const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=label:INBOX`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await response.json();
      if (response.status === 429) throw new Error('Gmail API Quota Exceeded. Please try again later.');
      if (!response.ok) throw new Error(`Gmail API Error: ${data.error?.message}`);

      const emailDetails = await Promise.all((data.messages || []).map(async (msg: any) => {
        const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const detailData = await detailRes.json();
        return {
          id: msg.id,
          snippet: detailData.snippet,
          subject: (detailData.payload.headers.find((h: any) => h.name === 'Subject') || {}).value,
          from: (detailData.payload.headers.find((h: any) => h.name === 'From') || {}).value,
        };
      }));

      return { emails: emailDetails };
    },
  },

  send_email: {
    name: 'gmail_send_email',
    description: 'Sends an email to a recipient.',
    requiresConfirmation: true,
    schema: z.object({
      to: z.string().email(),
      subject: z.string(),
      body: z.string(),
    }),
    execute: async ({ to, subject, body }: { to: string, subject: string, body: string }, userId: string) => {
      const accessToken = await OAuthManager.getValidAccessToken(userId);
      
      // Construct a simple RFC 2822 message
      const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
      const message = [
        `To: ${to}`,
        `Subject: ${utf8Subject}`,
        'Content-Type: text/plain; charset=utf-8',
        'MIME-Version: 1.0',
        '',
        body
      ].join('\r\n');

      const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: encodedMessage }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(`Gmail API Error: ${data.error?.message}`);

      return { success: true, messageId: data.id };
    },
  },

  create_draft: {
    name: 'gmail_create_draft',
    description: 'Creates a draft email.',
    requiresConfirmation: true,
    schema: z.object({
      to: z.string().email(),
      subject: z.string(),
      body: z.string(),
    }),
    execute: async ({ to, subject, body }: { to: string, subject: string, body: string }, userId: string) => {
      const accessToken = await OAuthManager.getValidAccessToken(userId);
      
      const message = [
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        body
      ].join('\r\n');

      const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: { raw: encodedMessage } }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(`Gmail API Error: ${data.error?.message}`);

      return { success: true, draftId: data.id };
    },
  },
};
