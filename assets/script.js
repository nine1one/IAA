const form = document.querySelector("#contact-form");
const statusEl = document.querySelector("#form-status");
const submitButton = form.querySelector("button[type=submit]");
const buttonLabel = form.querySelector(".button-label");

document.querySelector("#year").textContent = new Date().getFullYear();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusEl.textContent = "";
  statusEl.classList.remove("error");
  submitButton.disabled = true;
  buttonLabel.textContent = "Sending…";

  const payload = Object.fromEntries(new FormData(form).entries());

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Unable to send your enquiry. Please try again.");
    form.reset();
    statusEl.textContent = "Your enquiry has been sent. Thank you — the owner will be in touch.";
  } catch (error) {
    statusEl.textContent = error.message || "Something went wrong. Please try again.";
    statusEl.classList.add("error");
  } finally {
    submitButton.disabled = false;
    buttonLabel.textContent = "Send enquiry";
  }
});
