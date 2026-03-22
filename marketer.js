// marketer.js - Market Feeds & Smart Search
let scrollTimer;
const SCROLL_SPEED = 1; // Pixels per frame
const IDLE_DELAY = 20000; // 20 seconds

document.addEventListener('DOMContentLoaded', () => {
    const feed = document.querySelector('.feed-container');
    if (!feed) return;

    // --- AUTO-SCROLL LOGIC ---
    function startAutoScroll() {
        if (scrollTimer) clearInterval(scrollTimer);
        scrollTimer = setInterval(() => {
            feed.scrollLeft += SCROLL_SPEED;
            // Loop back to start if end reached
            if (feed.scrollLeft >= (feed.scrollWidth - feed.clientWidth)) {
                feed.scrollLeft = 0;
            }
        }, 30);
    }

    function resetIdleTimer() {
        clearInterval(scrollTimer); // Stop scrolling immediately
        clearTimeout(window.resumeTimer);
        // Standby for 20 seconds before resuming
        window.resumeTimer = setTimeout(startAutoScroll, IDLE_DELAY);
    }

    // Pause on user interaction (scroll or touch)
    feed.addEventListener('scroll', resetIdleTimer, { passive: true });
    feed.addEventListener('touchstart', () => clearInterval(scrollTimer));
    
    startAutoScroll(); // Initial start
});

// --- SMART SEARCH & SELECT INTEGRATION ---
async function openMarketingMap() {
    const userInput = prompt("Enter a place name or city to find recycling rates:", "Bloemfontein");
    if (!userInput) return;

    // Use Google Maps Search with specific 'recycling' keyword
    const searchQuery = encodeURIComponent(`${userInput} recycling center`);
    window.open(`https://www.google.com{searchQuery}`, '_blank');

    // Reveal related places in the dropdown (Simulated logic)
    const select = document.getElementById('matType');
    const newOption = document.createElement('option');
    newOption.text = `[Map Result] ${userInput} Rates`;
    newOption.value = "140"; // Custom rate from search
    select.add(newOption, 0);
    select.selectedIndex = 0;
}
// Replace with your actual free API key from metals.dev or metals-api.com
const API_KEY = 'YOUR_FREE_KEY'; 

async function fetchLivePrices() {
    try {
        const response = await fetch(`https://api.metals.dev{API_KEY}&currency=ZAR&unit=kg`);
        const data = await response.json();
        
        // Update your Copper Mix if available in API
        if (data.rates && data.rates.CU) {
            updateDefaultPrice(data.rates.CU.toFixed(2));
            showSuccessToast("Live Market Rates Updated");
        }
    } catch (error) {
        console.error("Market Feed Error:", error);
    }
}

// Call this once during the boot sequence
