"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function getWalletBalance(userId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("transactions")
      .select("amount, type")
      .eq("user_id", userId)
      .eq("status", "completed");

    if (error) {
      console.error("Error fetching wallet balance:", error);
      return { balance: 0, currency: "USD" };
    }

    let balance = 0;
    if (data) {
      for (const tx of data) {
        const amt = Number(tx.amount);
        if (['reward', 'deposit', 'escrow_release'].includes(tx.type)) {
          balance += amt;
        } else if (['withdrawal', 'fee', 'escrow_hold', 'purchase'].includes(tx.type)) {
          balance -= amt;
        }
      }
    }

    return { balance, currency: "USD" }; // Currency could be fetched from profile if needed
  } catch (error) {
    console.error("Failed to fetch wallet balance:", error);
    return { balance: 0, currency: "USD" };
  }
}

export async function getTransactionHistory(userId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return [];
  }
}

export async function addFunds(userId: string, amount: number) {
  // SECURITY FIX: addFunds is disabled in production to prevent infinite money exploits
  console.warn(`Unauthorized attempt to add funds for user ${userId}`);
  return { success: false, error: "Operation disabled in production" };
}

export async function processPayment(userId: string, amount: number, description: string) {
  // SECURITY FIX: processPayment is disabled in production to prevent exploits
  console.warn(`Unauthorized attempt to process payment for user ${userId}`);
  return { success: false, error: "Operation disabled in production" };
}
