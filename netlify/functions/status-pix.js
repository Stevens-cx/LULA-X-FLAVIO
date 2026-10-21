const jsonResponse = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

export default async (req) => {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return jsonResponse({ error: "id obrigatório" }, 400);

    if (!process.env.BRAVOPAY_API_KEY) {
      return jsonResponse({ error: "Serviço de pagamento não configurado" }, 503);
    }

    const response = await fetch(
      `https://bravopay.club/api/v1/transactions/${encodeURIComponent(id)}`,
      { headers: { Authorization: `Bearer ${process.env.BRAVOPAY_API_KEY}` } }
    );
    const text = await response.text();

    if (!text.trim()) {
      return jsonResponse({ error: "O provedor de pagamento retornou uma resposta vazia" }, 502);
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return jsonResponse({ error: "O provedor de pagamento retornou uma resposta inválida" }, 502);
    }

    if (!response.ok) {
      return jsonResponse(
        { error: data.message || data.error || "Não foi possível consultar o pagamento" },
        response.status
      );
    }

    if (!data.status) {
      return jsonResponse({ error: "Status do pagamento não informado pelo provedor" }, 502);
    }

    return jsonResponse({ status: data.status });
  } catch {
    return jsonResponse({ error: "Não foi possível comunicar com o provedor de pagamento" }, 502);
  }
};
