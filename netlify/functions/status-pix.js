export default async (req) => {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return new Response("id obrigatório", { status: 400 });

  const r = await fetch(
    `https://bravopay.club/api/v1/transactions/${encodeURIComponent(id)}`,
    { headers: { Authorization: `Bearer ${process.env.BRAVOPAY_API_KEY}` } }
  );
  const data = await r.json();

  // Devolve só o necessário pro front
  return new Response(JSON.stringify({ status: data.status }), {
    headers: { "Content-Type": "application/json" },
  });
};
