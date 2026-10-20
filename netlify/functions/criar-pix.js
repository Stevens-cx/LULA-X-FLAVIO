// Cria a cobrança PIX na BravoPay. A chave fica só aqui, no servidor.
export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Método não permitido", { status: 405 });
  }

  const { customer, utm, amount_cents } = await req.json();
  // Limites de valor (em centavos). Ajuste como quiser.
const MIN_CENTS = 500;     // R$ 5,00
const MAX_CENTS = 100000;  // R$ 1.000,00

const AMOUNT_CENTS = Number(amount_cents);
if (!Number.isInteger(AMOUNT_CENTS) || AMOUNT_CENTS < MIN_CENTS || AMOUNT_CENTS > MAX_CENTS) {
  return new Response(JSON.stringify({ error: "Valor inválido" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}
  const body = {
    amount_cents: AMOUNT_CENTS,
    method: "pix",
    customer, // { name, email, phone, cpf }
    external_reference: "pedido_" + Date.now(),
    utm, // obrigatório pro UTMify atribuir a venda
  };
  if (process.env.BRAVOPAY_PRODUCT_ID) {
    body.product_id = process.env.BRAVOPAY_PRODUCT_ID;
  }

  const r = await fetch("https://bravopay.club/api/v1/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.BRAVOPAY_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const data = await r.json();
  return new Response(JSON.stringify(data), {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
};
