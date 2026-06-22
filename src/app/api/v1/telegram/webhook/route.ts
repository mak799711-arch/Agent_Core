import { NextRequest, NextResponse } from 'next/server';
import { authService, offerRepository, referralRepository, walletRepository } from '@/lib/services';

// In-memory state storage for the bot.
// Key: chatId (number), Value: state object
const userStates = new Map<number, { step: 'waiting_for_bill'; code: string }>();

async function sendTelegramMessage(chatId: number, text: string, replyMarkup?: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || token === 'mock_token') {
    console.log(`[Mock Telegram Bot] To: ${chatId}, Text: "${text}", Markup:`, replyMarkup);
    return;
  }
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        reply_markup: replyMarkup,
      }),
    });
  } catch (e) {
    console.error('Error sending Telegram message:', e);
  }
}

async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || token === 'mock_token') {
    console.log(`[Mock Telegram Bot] Answer callback query: ${callbackQueryId}, Text: "${text}"`);
    return;
  }
  try {
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
      }),
    });
  } catch (e) {
    console.error('Error answering callback query:', e);
  }
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    // Always log update for debugging
    console.log('Received Telegram Update:', JSON.stringify(body));

    // 1. Handle Callback Query
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const chatId = callbackQuery.message.chat.id;
      const callbackQueryId = callbackQuery.id;
      const data = callbackQuery.data || '';

      await answerCallbackQuery(callbackQueryId);

      if (data.startsWith('confirm_pay:')) {
        const code = data.split(':')[1];
        // Set user state to wait for bill amount
        userStates.set(chatId, { step: 'waiting_for_bill', code });

        await sendTelegramMessage(
          chatId,
          `Введите итоговую сумму чека цифрами (например, 150) или выберите одну из стандартных сумм ниже:`,
          {
            inline_keyboard: [
              [
                { text: '10', callback_data: `bill:10:${code}` },
                { text: '25', callback_data: `bill:25:${code}` },
              ],
              [
                { text: '50', callback_data: `bill:50:${code}` },
                { text: '100', callback_data: `bill:100:${code}` },
              ],
            ],
          }
        );
      } else if (data.startsWith('bill:')) {
        const parts = data.split(':');
        const amountStr = parts[1];
        const code = parts[2];
        const amount = parseFloat(amountStr);

        if (isNaN(amount) || amount <= 0) {
          await sendTelegramMessage(chatId, 'Некорректная сумма чека.');
        } else {
          await processCompleteTransaction(chatId, code, amount);
        }
      }
      return NextResponse.json({ ok: true });
    }

    // 2. Handle Message
    if (body.message) {
      const message = body.message;
      const chatId = message.chat.id;
      const text = (message.text || '').trim();

      if (text.startsWith('/start')) {
        userStates.delete(chatId);
        await sendTelegramMessage(
          chatId,
          `Привет! Добро пожаловать в бот официанта.\n\nВведите 6-значный код клиента, чтобы применить скидку.`
        );
        return NextResponse.json({ ok: true });
      }

      // Check state machine
      const state = userStates.get(chatId);
      if (state && state.step === 'waiting_for_bill') {
        const amount = parseFloat(text);
        if (isNaN(amount) || amount <= 0) {
          await sendTelegramMessage(chatId, 'Сумма должна быть положительным числом. Пожалуйста, введите корректное число или выберите одну из кнопок выше.');
        } else {
          await processCompleteTransaction(chatId, state.code, amount);
        }
        return NextResponse.json({ ok: true });
      }

      // 6-digit code regular expression
      if (/^\d{6}$/.test(text)) {
        const session = await referralRepository.getSessionByCode(text);

        if (!session) {
          await sendTelegramMessage(chatId, 'Код недействителен или устарел.');
          return NextResponse.json({ ok: true });
        }

        // Get offer
        const offer = await offerRepository.getOfferById(session.offerId);
        if (!offer) {
          await sendTelegramMessage(chatId, 'Не удалось найти оффер для этой сессии.');
          return NextResponse.json({ ok: true });
        }

        // Get business profile
        const users = await authService.getAllUsers();
        const biz = users.find((u) => u.id === session.businessId);
        const bizName = biz?.fullName || 'Заведение';

        // Prepare offer reward text
        let rewardText = '';
        if (offer.rewardType === 'percentage') {
          rewardText = `${offer.rewardPercent}%`;
        } else {
          rewardText = `${offer.rewardAmount} ${biz?.currency || 'USD'}`;
        }

        const infoMessage = `Код найден!\n\n` +
          `🏷 Оффер: ${offer.title}\n` +
          `🏨 Бизнес: ${bizName}\n` +
          `🎁 Размер скидки/вознаграждения: ${rewardText}\n\n` +
          `Нажмите кнопку ниже, чтобы подтвердить оплату:`;

        await sendTelegramMessage(chatId, infoMessage, {
          inline_keyboard: [
            [
              { text: '✅ Подтвердить оплату', callback_data: `confirm_pay:${text}` }
            ]
          ]
        });
      } else {
        await sendTelegramMessage(chatId, 'Пожалуйста, введите 6-значный код клиента, чтобы применить скидку.');
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error handling Telegram Webhook request:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

async function processCompleteTransaction(chatId: number, code: string, billAmount: number) {
  try {
    userStates.delete(chatId);

    // 1. Verify active session
    const session = await referralRepository.getSessionByCode(code);
    if (!session) {
      await sendTelegramMessage(chatId, 'Код недействителен, устарел или уже был применен.');
      return;
    }

    // 2. Load Offer
    const offer = await offerRepository.getOfferById(session.offerId);
    if (!offer) {
      await sendTelegramMessage(chatId, 'Оффер не найден.');
      return;
    }

    // 3. Compute reward & Platform fee
    let computedReward = offer.rewardAmount;
    if (offer.rewardType === 'percentage' && offer.rewardPercent !== null) {
      computedReward = billAmount * (offer.rewardPercent / 100);
    }
    computedReward = Math.round(computedReward * 100) / 100;

    const platformFee = Math.round(billAmount * 0.01 * 100) / 100;
    const totalRequired = computedReward + platformFee;

    // 4. Check business balance
    const businessBalance = await walletRepository.getBalance(session.businessId);
    if (businessBalance < totalRequired) {
      await sendTelegramMessage(chatId, `Ошибка: Недостаточно средств на балансе резерва бизнеса (${businessBalance}). Требуется: ${totalRequired}.`);
      return;
    }

    // 5. Complete Session
    await referralRepository.completeSession(session.id);

    // 6. Create transactions
    // Reward promoter
    await walletRepository.createTransaction({
      userId: session.partnerId,
      amount: computedReward,
      type: 'reward',
      sessionId: session.id,
      status: 'completed',
    });

    // Deduct reward from business
    await walletRepository.createTransaction({
      userId: session.businessId,
      amount: computedReward,
      type: 'fee',
      sessionId: session.id,
      status: 'completed',
    });

    // Deduct fee from business
    await walletRepository.createTransaction({
      userId: session.businessId,
      amount: platformFee,
      type: 'fee',
      sessionId: session.id,
      status: 'completed',
    });

    const successMsg = `🎉 Транзакция успешно подтверждена!\n\n` +
      `Сумма чека: ${billAmount}\n` +
      `Вознаграждение промоутеру: ${computedReward}\n` +
      `Комиссия платформы (1%): ${platformFee}\n\n` +
      `Баланс бизнеса обновлен. Спасибо!`;

    await sendTelegramMessage(chatId, successMsg);
  } catch (error: any) {
    console.error('Error processing completion inside bot:', error);
    await sendTelegramMessage(chatId, `Произошла внутренняя ошибка: ${error.message}`);
  }
}
