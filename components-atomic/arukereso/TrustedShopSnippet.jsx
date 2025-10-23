/**
 * Server Component that embeds the Trusted Shop snippet.
 * Place this on your order confirmation page (server-rendered).
 *
 * @param {Object} props]
 * */
export default function TrustedShopSnippet({ html }) {
    try {
        return <div dangerouslySetInnerHTML={{ __html: html }} />;
    } catch (err) {
        // Optional: swallow or log; the PHP sample suggested optional error handling.
        console.error("TrustedShop snippet error:", err);
        return null;
    }
}
