const jsonResponse = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

async function readJson(response) {
  const text = await response.text();
  if (!text.trim()) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// Cria a cobrança PIX na BravoPay. A chave fica só aqui, no servidor.
export default async (req) => {
  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "Método não permitido" }, 405);
    }

    if (!process.env.BRAVOPAY_API_KEY) {
      return jsonResponse({ error: "Serviço de pagamento não configurado" }, 503);
    }

    let payload;
    try {
      payload = await req.json();
    } catch {
      return jsonResponse({ error: "Corpo da requisição inválido" }, 400);
    }

    const { customer, utm, amount_cents } = payload;
    const MIN_CENTS = 500;
    const MAX_CENTS = 100000;
    const amountCents = Number(amount_cents);

    if (!Number.isInteger(amountCents) || amountCents < MIN_CENTS || amountCents > MAX_CENTS) {
      return jsonResponse({ error: "Valor inválido" }, 400);
    }

    const body = {
      amount_cents: amountCents,
      method: "pix",
      customer,
      external_reference: "pedido_" + Date.now(),
      utm,
    };
    if (process.env.BRAVOPAY_PRODUCT_ID) {
      body.product_id = process.env.BRAVOPAY_PRODUCT_ID;
    }

    const response = await fetch("https://bravopay.club/api/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.BRAVOPAY_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await readJson(response);
    if (!data) {
      return jsonResponse({ error: "O provedor de pagamento retornou uma resposta vazia ou inválida" }, 502);
    }

    return jsonResponse(data, response.status);
  } catch {
    return jsonResponse({ error: "Não foi possível comunicar com o provedor de pagamento" }, 502);
  }
};
