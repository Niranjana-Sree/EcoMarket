import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase client using the anon key for user authentication.
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Retrieve authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    // Get request body
    const { product_id, quantity = 1 } = await req.json();
    
    if (!product_id) {
      throw new Error("Product ID is required");
    }

    // Get product details
    const { data: product, error: productError } = await supabaseClient
      .from("products")
      .select("*")
      .eq("id", product_id)
      .single();

    if (productError || !product) {
      throw new Error("Product not found");
    }

    const totalAmount = product.price * quantity;
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create order in database first
    const { error: orderError } = await supabaseClient.from("orders").insert({
      buyer_id: user.id,
      product_id: product.id,
      quantity: quantity,
      total_amount: totalAmount,
      payment_info: {
        razorpay_order_id: orderId,
        payment_status: "pending",
      },
    });

    if (orderError) {
      console.error("Order creation error:", orderError);
      throw new Error("Failed to create order");
    }

    // Create Razorpay order
    const razorpayOrder = {
      amount: Math.round(totalAmount * 100), // Convert to paise
      currency: "INR",
      receipt: orderId,
      notes: {
        product_id: product.id,
        buyer_id: user.id,
        quantity: quantity.toString(),
        product_name: product.name,
      },
    };

    // Make request to Razorpay API
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`${Deno.env.get("RAZORPAY_KEY_ID")}:${Deno.env.get("RAZORPAY_KEY_SECRET")}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(razorpayOrder),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      throw new Error(`Razorpay API error: ${errorText}`);
    }

    const razorpayData = await razorpayResponse.json();

    return new Response(JSON.stringify({ 
      order_id: razorpayData.id,
      amount: razorpayData.amount,
      currency: razorpayData.currency,
      key_id: Deno.env.get("RAZORPAY_KEY_ID"),
      name: "EcoMarket",
      description: product.name,
      prefill: {
        email: user.email,
        name: user.user_metadata?.name || user.email,
      },
      theme: {
        color: "#059669"
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});