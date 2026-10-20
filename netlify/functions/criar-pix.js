// Cria a cobrança PIX na BravoPay. A chave fica só aqui, no servidor.
export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Método não permitido", { status: 405 });
  }

  const { customer, utm } = await req.json();

  // O valor é definido NO SERVIDOR, para ninguém alterar o preço pelo navegador
  const AMOUNT_CENTS = 9990;

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
