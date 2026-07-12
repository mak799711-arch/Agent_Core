import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Инициализируем Supabase Admin Client для обхода RLS при записи транзакций
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // В MVP используем ANON, если нет Service Role

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Секретный токен Xendit для верификации вебхуков (заглушка для MVP)
const XENDIT_WEBHOOK_TOKEN = process.env.XENDIT_WEBHOOK_TOKEN || 'xnd_development_dummy_token';

export async function POST(req: Request) {
  try {
    // 1. БЕЗОПАСНОСТЬ: Валидация Callback Токена от Xendit
    const callbackToken = req.headers.get('x-callback-token');
    
    if (callbackToken !== XENDIT_WEBHOOK_TOKEN) {
      console.warn('Unauthorized webhook request from Xendit');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const eventId = payload.id; // Уникальный ID события Xendit
    const eventType = payload.event; // Например, 'invoice.paid' или 'payment.succeeded'

    console.log(`[Xendit Webhook] Received event: ${eventType} (ID: ${eventId})`);

    // 2. ИДЕМПОТЕНТНОСТЬ: Проверка на дубликаты
    const { data: existingEvent, error: checkError } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('id', eventId)
      .single();

    if (existingEvent) {
      console.log(`[Xendit Webhook] Event ${eventId} already processed.`);
      return NextResponse.json({ received: true, message: 'Already processed' });
    }

    // Сохраняем событие, чтобы предотвратить двойную обработку
    await supabase.from('webhook_events').insert({
      id: eventId,
      provider: 'xendit',
      type: eventType,
      payload: payload
    });

    // 3. СТЕЙТ-МАШИНА: Обработка статусов платежа
    if (eventType === 'invoice.paid') {
      const paymentExternalId = payload.external_id; // Наш внутренний ID, переданный Xendit при создании
      const amountPaid = payload.paid_amount;

      // Обновляем статус платежа в tourist_payments
      const { data: payment, error: updateError } = await supabase
        .from('tourist_payments')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('external_id', paymentExternalId)
        .eq('status', 'pending') // Важно: обновляем только если был pending
        .select()
        .single();

      if (updateError) {
        console.error('Error updating payment status:', updateError);
        // Не возвращаем 500, так как Xendit будет бесконечно повторять, если платеж не найден.
        // Вместо этого можно добавить в DLQ (Dead Letter Queue), но в MVP просто логируем.
      } else if (payment) {
        console.log(`[Xendit Webhook] Payment ${payment.id} marked as completed.`);
        
        // В реальном боевом коде здесь будет вызываться RPC функция, 
        // которая начисляет деньги агенту и платформе в таблице wallet_transactions
        // На данном этапе мы просто имитируем успешную оплату.
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[Xendit Webhook] Error processing webhook:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
