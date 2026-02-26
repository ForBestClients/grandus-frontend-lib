'use client';
import { useEffect, useRef } from 'react';

export default function TrustedShopSnippet({ html }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!html || !containerRef.current) return;

        const container = containerRef.current;
        container.innerHTML = html;

        // Script tagy vložené cez innerHTML sa nespúšťajú.
        // Nahradíme ich novými createElement('script') elementami, ktoré prehliadač spustí.
        container.querySelectorAll('script').forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            newScript.textContent = oldScript.textContent;
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    }, [html]);

    return <div ref={containerRef} />;
}
