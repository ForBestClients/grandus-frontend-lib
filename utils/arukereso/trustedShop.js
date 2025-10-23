// lib/trustedShop.js

/**
 * Build the Trusted Shop snippet using native fetch.
 *
 * @param {Object} opts
 * @param {string} opts.webApiKey
 * @param {string} opts.email
 * @param {Array<{name:string, id?:string}>} opts.products
 * @returns {Promise<string>} HTML snippet
 */
export async function buildTrustedShopHtml({ webApiKey, email, products }) {
    const SERVICE_URL_SEND = "https://www.arukereso.hu/";
    const SERVICE_URL_AKU = "https://assets.arukereso.com/aku.min.js";
    const SERVICE_TOKEN_REQUEST = "t2/TokenRequest.php";
    const SERVICE_TOKEN_PROCESS = "t2/TrustedShop.php";

    // --- basic validations (mirrors PHP sample) ---
    if (!webApiKey) throw new Error("Partner WebApiKey is empty.");
    if (!email) throw new Error("Customer e-mail address is empty.");
    if (!products) throw new Error("Products are empty.");

    // --- fetch with a tight timeout ---
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 500);

    const form = new URLSearchParams({
        Version: "2.0/JS",
        WebApiKey: webApiKey,
        Email: email,
        Products: JSON.stringify(
            (products || []).map(p => {
                const out = { Name: p.name };
                if (p.id) out.Id = p.id;
                return out;
            })
        ),
    });

    let res;
    try {
        res = await fetch(`${SERVICE_URL_SEND}${SERVICE_TOKEN_REQUEST}`, {
            method: "POST",
            headers: {
                // Explicit header to match form-encoded POST
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
            body: form.toString(),
            cache: "no-store",
            signal: controller.signal,
        });
    } catch (e) {
        clearTimeout(timer);
        if (e.name === "AbortError") throw new Error("Token request timed out.");
        throw e;
    }
    clearTimeout(timer);

    // Try to parse JSON; if not JSON, throw like the PHP sample’s “Json error”
    let data;
    try {
        data = await res.json();
    } catch {
        throw new Error("Json error: invalid response.");
    }

    if (res.status === 200) {
        const qp = new URLSearchParams({
            Token: String(data.Token || ""),
            WebApiKey: webApiKey,
            C: "", // will be concatenated with callback arg "c"
        }).toString();
        const query = `?${qp}`;
        const random = Math.random().toString(36).slice(2);

        return [
            `<script type="text/javascript">`,
            `window.aku_request_done = function (w, c) {`,
            `  var I = new Image();`,
            `  I.src = "${SERVICE_URL_SEND}${SERVICE_TOKEN_PROCESS}${query}" + c;`,
            `};`,
            `</script>`,
            `<script type="text/javascript">(function(){`,
            `  var a = document.createElement("script");`,
            `  a.type = "text/javascript";`,
            `  a.src = "${SERVICE_URL_AKU}";`,
            `  a.async = true;`,
            `  (document.head || document.body).appendChild(a);`,
            `})();</script>`,
            `<noscript>`,
            `  <img src="${SERVICE_URL_SEND}${SERVICE_TOKEN_PROCESS}${query}${random}" />`,
            `</noscript>`,
        ].join("\n");
    }

    if (res.status === 400) {
        throw new Error(
            `Bad request: ${data?.ErrorCode ?? ""} - ${data?.ErrorMessage ?? ""}`.trim()
        );
    }

    throw new Error("Token request failed.");
}
