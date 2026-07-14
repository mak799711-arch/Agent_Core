"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function getWalletBalance(userId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("wallets")
      .select("balance, currency")
      .eq("owner_id", userId)
      .single();

    if (error) {
      console.error("Error fetching wallet balance:", error);
      return { balance: 0, currency: "USD" };
    }

    return data || { balance: 0, currency: "USD" };
  } catch (error) {
    console.error("Failed to fetch wallet balance:", error);
    return { balance: 0, currency: "USD" };
  }
}

export async function getTransactionHistory(userId: string) {
  try {
    // First get wallet ID
    const { data: wallet } = await supabaseAdmin
      .from("wallets")
      .select("id")
      .eq("owner_id", userId)
      .single();

    if (!wallet) return [];

    const { data, error } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("wallet_id", wallet.id)
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
  try {
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from("wallets")
      .select("id, balance")
      .eq("owner_id", userId)
      .single();

    if (walletError || !wallet) {
      throw new Error("Wallet not found");
    }

    const newBalance = Number(wallet.balance) + amount;

    // 1. Update wallet balance
    const { error: updateError } = await supabaseAdmin
      .from("wallets")
      .update({ balance: newBalance })
      .eq("id", wallet.id);

    if (updateError) throw updateError;

    // 2. Log transaction
    const { error: txError } = await supabaseAdmin.from("transactions").insert({
      wallet_id: wallet.id,
      type: "deposit",
      amount: amount,
      description: "Account funding (Mock)",
    });

    if (txError) throw txError;

    revalidatePath("/wallet");
    revalidatePath("/partner");
    revalidatePath("/business");
    return { success: true, balance: newBalance };
  } catch (error: any) {
    console.error("Failed to add funds:", error);
    return { success: false, error: error.message };
  }
}

export async function processPayment(userId: string, amount: number, description: string) {
  try {
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from("wallets")
      .select("id, balance")
      .eq("owner_id", userId)
      .single();

    if (walletError || !wallet) throw new Error("Wallet not found");
    
    if (Number(wallet.balance) < amount) {
      return { success: false, error: "Insufficient funds" };
    }

    const newBalance = Number(wallet.balance) - amount;

    // 1. Deduct from wallet
    const { error: updateError } = await supabaseAdmin
      .from("wallets")
      .update({ balance: newBalance })
      .eq("id", wallet.id);

    if (updateError) throw updateError;

    // 2. Log transaction
    const { error: txError } = await supabaseAdmin.from("transactions").insert({
      wallet_id: wallet.id,
      type: "purchase",
      amount: -amount,
      description: description,
    });

    if (txError) throw txError;

    revalidatePath("/wallet");
    revalidatePath("/partner");
    revalidatePath("/business");
    return { success: true, balance: newBalance };
  } catch (error: any) {
    console.error("Failed to process payment:", error);
    return { success: false, error: error.message };
  }
}
