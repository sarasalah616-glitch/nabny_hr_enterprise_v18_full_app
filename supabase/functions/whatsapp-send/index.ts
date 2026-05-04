// Supabase Edge Function sample for WhatsApp Official Cloud API
// Secrets required:
// WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
serve(async (req) => {
  try {
    const { to, message } = await req.json();
    const token = Deno.env.get('WHATSAPP_TOKEN');
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
    if (!token || !phoneNumberId) return new Response(JSON.stringify({ error: 'Missing WhatsApp secrets' }), { status: 400 });
    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: message } })
    });
    const data = await res.json();
    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' }, status: res.status });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
