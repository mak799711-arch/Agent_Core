export class XenditGateway {
  constructor() {}

  /**
   * Creates a payment invoice link in Xendit
   */
  async createInvoice(params: {
    externalId: string;
    amount: number;
    description: string;
    payerEmail?: string;
    currency?: string;
    successRedirectUrl: string;
    failureRedirectUrl: string;
    splits?: {
      platformFee?: number;
      splitRules?: any[]; // xenPlatform routing rules can go here later
    }
  }): Promise<{ invoiceUrl: string; invoiceId: string }> {
    try {
      const apiKey = process.env.XENDIT_SECRET_KEY || 'xnd_development_dummy_key';
      const authString = Buffer.from(`${apiKey}:`).toString('base64');

      const response = await fetch('https://api.xendit.co/v2/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authString}`
        },
        body: JSON.stringify({
          external_id: params.externalId,
          amount: params.amount,
          description: params.description,
          customer: params.payerEmail ? { email: params.payerEmail } : undefined,
          currency: params.currency || 'IDR',
          success_redirect_url: params.successRedirectUrl,
          failure_redirect_url: params.failureRedirectUrl
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Payment provider error');
      }

      return {
        invoiceUrl: data.invoice_url,
        invoiceId: data.id
      };
    } catch (error: any) {
      console.error('Xendit createInvoice error:', error);
      throw new Error(`Failed to create Xendit invoice: ${error.message}`);
    }
  }

  /**
   * Verifies an incoming webhook from Xendit
   */
  verifyWebhook(callbackToken: string): boolean {
    const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN;
    if (!expectedToken) {
      console.warn('XENDIT_WEBHOOK_TOKEN is not set, skipping verification');
      return true; // For local testing only
    }
    return callbackToken === expectedToken;
  }
}

export const xenditGateway = new XenditGateway();
