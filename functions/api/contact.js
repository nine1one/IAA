const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });

export async function onRequestPost({ request, env }) {
  if (!env.RESEND_API_KEY || !env.OWNER_EMAIL || !env.FROM_EMAIL) {
    return json({ error: "The enquiry form is not configured yet. Please try again later." }, 503);
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: "Invalid form submission." }, 400);
  }

  // Honeypot field: bots often fill hidden inputs.
  if (typeof data.website === "string" && data.website.trim()) {
    return json({ success: true });
  }

  const name = clean(data.name, 100);
  const email = clean(data.email, 254);
  const offer = clean(data.offer, 80);
  const message = clean(data.message, 3000);

  if (!name || !email || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Please provide a valid name, email address, and message." }, 400);
  }

  const text = [
    "New initialace.ca domain enquiry",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Offer: ${offer || "Not specified"}`,
    "",
    "Message:",
    message
  ].join("\n");

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: env.FROM_EMAIL,
      to: [env.OWNER_EMAIL],
      reply_to: email,
      subject: `initialace.ca enquiry from ${name}`,
      text
    })
  });

  if (!emailResponse.ok) {
    // Do not expose provider responses or secrets to the browser.
    return json({ error: "Your message could not be delivered right now. Please try again later." }, 502);
  }

  return json({ success: true });
}

function clean(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}
