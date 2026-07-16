import { Invoice as InvoiceClient } from 'xendit-node';

export class XenditGateway {
  private invoiceClient: InvoiceClient;

  constructor() {
    // We will initialize Xendit with the API key from environment variables
    const secretKey = process.env.XENDIT_SECRET_KEY || 'xnd_development_dummy_key';
    this.invoiceClient = new InvoiceClient({ secretKey });
  }

  /**
   * Creates a payment invoice link in Xendit
   */
  async createInvoice(params: {
    externalId: string;
    amount: number;
    description: string;
    payerEmail?: string;
    successRedirectUrl: string;
    failureRedirectUrl: string;
    splits?: {
      platformFee?: number;
      splitRules?: any[]; // xenPlatform routing rules can go here later
    }
  }): Promise<{ invoiceUrl: string; invoiceId: string }> {
    try {
      const data = {
        externalId: params.externalId,
        amount: params.amount,
        description: params.description,
        payerEmail: params.payerEmail,
        successRedirectUrl: params.successRedirectUrl,
        failureRedirectUrl: params.failureRedirectUrl,
        currency: 'IDR'
      };

      // Create the invoice
      const response = await this.invoiceClient.createInvoice({
        data
      });

      return {
        invoiceUrl: response.invoiceUrl,
        invoiceId: response.id
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
