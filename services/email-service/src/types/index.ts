export interface ContactEmailRequest {
  email: string;
  name?: string;
  subject?: string;
  message?: string;
}

export interface ContactEmailResponse {
  message: string;
  messageId: string;
}

export interface EmailTemplate {
  html: string;
  text: string;
}

export interface MailOptions {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}

export interface EmailServiceConfig {
  service: string;
  auth: {
    user: string;
    pass: string;
  };
}
