# Agent Core Loyverse POS Connector

This connector integrates Loyverse POS with the Agent Core referral network. It tracks receipt completions and reports sales transactions to process commission distributions and rewards on the fly.

## Setup Instructions

1. **Get Loyverse API Token**:
   * Log into your Loyverse Backoffice.
   * Go to **Settings** -> **Access tokens**.
   * Click **Add Access Token**, name it `Agent Core Connector`, grant read access to receipts, and click **Save**.
   * Copy the generated token.

2. **Configure in Agent Core settings**:
   * Navigate to the **Business Dashboard** -> **Settings**.
   * Locate the **POS Integration (Loyverse)** panel.
   * Paste the API Access Token in the token field.
   * Save changes.

3. **Configure Loyverse Webhook Callback**:
   * In Loyverse Backoffice, navigate to **Settings** -> **Webhooks**.
   * Click **Add Webhook**.
   * Event type: `receipts.update` (or `receipts.create`).
   * Paste your Callback Webhook URL: `https://agent-core-app.vercel.app/api/v1/loyverse/webhook`
   * Click **Save**.

4. **Verify Connectivity**:
   * Conduct a mock sale transaction on your Loyverse POS app using a referral coupon code or discount.
   * Check your Agent Core business dashboard to see if the referral is tracked and commission is processed automatically.

---
Need support? Contact us at support@agent-core.com.
