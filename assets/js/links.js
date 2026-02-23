/**
 * Stealth Link Handler
 * Protects Baidu SEO by removing direct gambling/blocked outbound links from raw HTML.
 * URLs are Base64 encoded in data-base attribute and decoded only on user interaction.
 */
(function() {
    function initStealthLinks() {
        const stealthLinks = document.querySelectorAll('.stealth-link');
        
        stealthLinks.forEach(link => {
            // Add visual pointer to signal interactivity
            link.style.cursor = 'pointer';
            
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const encodedBase = this.getAttribute('data-base');
                const path = this.getAttribute('data-path') || '';
                
                if (encodedBase) {
                    try {
                        // Decode the base URL at runtime
                        const decodedBase = atob(encodedBase);
                        // Clean up trailing slash if path also has leading slash
                        const base = decodedBase.endsWith('/') ? decodedBase.slice(0, -1) : decodedBase;
                        const finalUrl = base + path;
                        
                        // Open in new tab with standard security protections
                        const win = window.open(finalUrl, '_blank');
                        if (win) {
                            win.focus();
                        }
                    } catch (err) {
                        console.error('Link decryption failed');
                    }
                }
            });
        });
    }

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStealthLinks);
    } else {
        initStealthLinks();
    }
})();