import {
  DISCREET_EMAIL_BODY,
  DISCREET_EMAIL_SUBJECT,
  type ReminderType,
} from "./types.ts";

export type EmailSendResult =
  | {
      ok: true;
      status: "accepted";
      providerMessageId: string | null;
    }
  | {
      ok: false;
      status: "failed" | "bounced";
      errorCategory: string;
      retryable: boolean;
    };

function checkinBody(): string {
  return `Hello,

Your little reminder to take a moment for yourself today.

Open Flowelle when you are ready to mark your self-care check-in.

With care,
Flowelle`;
}

export function buildReminderEmail(reminderType: ReminderType): {
  subject: string;
  text: string;
} {
  if (reminderType === "checkin") {
    return {
      subject: DISCREET_EMAIL_SUBJECT,
      text: checkinBody(),
    };
  }
  return {
    subject: DISCREET_EMAIL_SUBJECT,
    text: DISCREET_EMAIL_BODY,
  };
}

export function getEmailProviderConfig(): {
  configured: boolean;
  apiKey: string | null;
  from: string | null;
} {
  const apiKey = process.env.RESEND_API_KEY?.trim() || null;
  const from = process.env.RESEND_FROM_EMAIL?.trim() || null;
  return {
    configured: Boolean(apiKey && from),
    apiKey,
    from,
  };
}

export async function sendReminderEmail(input: {
  to: string;
  reminderType: ReminderType;
  fetchImpl?: typeof fetch;
}): Promise<EmailSendResult> {
  const config = getEmailProviderConfig();
  if (!config.configured || !config.apiKey || !config.from) {
    return {
      ok: false,
      status: "failed",
      errorCategory: "missing_credentials",
      retryable: false,
    };
  }

  if (!input.to.includes("@")) {
    return {
      ok: false,
      status: "failed",
      errorCategory: "invalid_email",
      retryable: false,
    };
  }

  const message = buildReminderEmail(input.reminderType);
  const fetchImpl = input.fetchImpl ?? fetch;

  try {
    const response = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.from,
        to: [input.to],
        subject: message.subject,
        text: message.text,
      }),
    });

    if (response.status === 429 || response.status >= 500) {
      return {
        ok: false,
        status: "failed",
        errorCategory: response.status === 429 ? "rate_limited" : "provider_outage",
        retryable: true,
      };
    }

    if (!response.ok) {
      const category =
        response.status === 422 ? "invalid_email" : "provider_rejected";
      return {
        ok: false,
        status: category === "invalid_email" ? "bounced" : "failed",
        errorCategory: category,
        retryable: false,
      };
    }

    const payload = (await response.json()) as { id?: string };
    return {
      ok: true,
      status: "accepted",
      providerMessageId: typeof payload.id === "string" ? payload.id : null,
    };
  } catch {
    return {
      ok: false,
      status: "failed",
      errorCategory: "network_error",
      retryable: true,
    };
  }
}
