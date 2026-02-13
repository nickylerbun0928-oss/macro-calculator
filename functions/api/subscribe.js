export async function onRequestPost({ request, env }) {
  console.log("subscribe hit", request.method, request.url);
  try {
    const body = await request.json();
    console.log("subscribe body", body);

    const email = String(body.email || "").trim().toLowerCase();
    if (!email) return json({ ok: false, message: "Missing email" }, 400);
    if (!body.consent) return json({ ok: false, message: "Consent required" }, 400);

    const listId = Number(env.BREVO_LIST_ID);

    const brevoRes = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "api-key": env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        email,
        listIds: [listId],
        updateEnabled: true,
        attributes: {
          FIRSTNAME: String(body.firstName || ""),
          LASTNAME: String(body.lastName || ""),
        },
      }),
    });

    if (!brevoRes.ok) {
      const errText = await brevoRes.text();
      return json({ ok: false, message: errText }, 400);
    }

    return json({ ok: true }, 200);
  } catch (e) {
    return json({ ok: false, message: String(e) }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}
