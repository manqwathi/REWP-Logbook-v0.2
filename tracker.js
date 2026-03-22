document.addEventListener('DOMContentLoaded', () => {
    console.log("REWP Logbook Ready");
    // Ensure all elements exist before starting
    if (document.getElementById('splash-screen')) {
        startBootSequence();
    }
});

function finishBoot() {
    const splash = document.getElementById('splash-screen');
    const content = splash.querySelector('.splash-content'); // Add this class to your logo wrapper
    
    // Add the decorative exit animation
    if(content) content.classList.add('splash-exit');
    splash.style.opacity = '0';

    // Haptic feedback
    if (window.navigator.vibrate) window.navigator.vibrate([50, 30, 50]);

    setTimeout(() => {
        splash.style.display = 'none';
        // Trigger initial calculation once app is visible
        if (typeof calculate === "function") calculate();
    }, 800);
}

function startBootSequence() {
    const fill = document.getElementById('boot-progress');
    const status = document.getElementById('boot-status');
    const skipBtn = document.getElementById('skip-btn');
    
    let progress = 0;
    const phases = [
        "Analyzing Hardware...",
        "Syncing Inventory...",
        "Loading Market Rates...",
        "Establishing Secure Link...",
        "Ready to Launch"
    ];

    // Show skip button after 3 seconds if load is slow
    setTimeout(() => { if(skipBtn) skipBtn.style.display = 'block'; }, 3000);

    const interval = setInterval(() => {
        // Variable speed for "realistic" loading
        let increment = progress < 70 ? Math.random() * 10 : Math.random() * 3;
        progress += increment;

        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            finishBoot();
        }

        // Update progress bar
        if(fill) fill.style.width = progress + "%";
        
        // Update text phase based on %
        let phaseIdx = Math.floor((progress / 100) * (phases.length - 1));
        if(status) status.innerText = `${phases[phaseIdx]} ${Math.floor(progress)}%`;
        
    }, 180);
}


// Toggle for Reminder Window
function toggleReminder() {
    const pop = document.getElementById('reminderPopup');
    pop.style.display = (pop.style.display === 'none' || pop.style.display === '') ? 'flex' : 'none';
}

// Save Target and Close
function saveReminder() {
    const val = document.getElementById('targetInput').value;
    if (val) {
        window.targetRevenue = parseFloat(val);
        showSuccessToast(`Alert set for R${val}`);
        toggleReminder(); // Close window
        calculate(); // Refresh UI to check if target is already hit
    }
}

// Toggle for Wallet Window
function toggleWallet() {
    const pop = document.getElementById('walletPopup');
    pop.style.display = (pop.style.display === 'none' || pop.style.display === '') ? 'flex' : 'none';
}

let fuelAlertTriggered = false; // Prevents constant vibrating

function updateGoalTracker(gross, travel) {
    const fill = document.getElementById('goalFill');
    const txt = document.getElementById('goalText');

    let percent = travel > 0 ? (gross / travel) * 100 : 0;
    
    // Move visual updates to an Animation Frame for speed
    requestAnimationFrame(() => {
        fill.style.width = Math.min(percent, 100) + "%";
        fill.style.background = percent >= 100 ? "#00ff88" : "#ff4d4d";
        txt.innerText = `${percent.toFixed(0)}% of Travel Covered`;
        
        // Vibrate and Toast logic remains the same
        if (percent >= 100 && !fuelAlertTriggered) {
            fuelAlertTriggered = true;
            showSuccessToast("⛽ FUEL COVERED!");
            if (window.navigator.vibrate) window.navigator.vibrate([200, 100, 500]);
        }
    });
}
// Visual Confirmation "Toast"
function showSuccessToast(message) {
    const toast = document.createElement('div');
    toast.className = 'savvy-toast';
    toast.innerHTML = `✅ ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 1500);
}

function openMapSearch() {
    // Get current location first for local bias
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // Opens Google Maps filtered specifically for recycling
            const query = encodeURIComponent("recycling center");
            window.open(`https://www.google.com{query}/@${lat},${lng},12z`, '_blank');
        }, () => {
            // Fallback if location is blocked
            window.open(`https://www.google.com`, '_blank');
        });
    }
}
// This fixes the "openMarketingMap is not defined" error
function openMarketingMap() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const url = `https://www.google.com{pos.coords.latitude},${pos.coords.longitude},12z`;
            window.open(url, '_blank');
            
            // After 2 seconds, remind user to update prices
            setTimeout(() => {
                const newPrice = prompt("Enter the new Copper Mix price (R/kg) found from map:", "135");
                if (newPrice) updateDefaultPrice(newPrice);
            }, 2000);
        });
    }
}

function updateDefaultPrice(price) {
    const select = document.getElementById('matType');
    // Finds the Copper option and updates its value and text
    for (let opt of select.options) {
        if (opt.text.includes("Copper")) {
            opt.value = price;
            opt.text = `Copper Mix (R${price})`;
            showSuccessToast(`Price updated to R${price}/kg`);
            break;
        }
    }
}
function skipBoot() {
    const splash = document.getElementById('splash-screen');
    splash.style.opacity = '0';
    setTimeout(() => splash.remove(), 500);
}
function setReminder() {
    const target = prompt("Notify me when Gross Revenue reaches (R):", "1000");
    if (target) {
        showSuccessToast(`Reminder set for R${target}`);
        // Store target to check in updateGoalTracker
        window.targetRevenue = parseFloat(target);
    }
}

// Update your existing updateGoalTracker to check this:
// if (gross >= window.targetRevenue) { alert("Target Reached!"); window.targetRevenue = null; }
function testAlert() {
    const notifyBtn = document.querySelector('.notify-btn');
    notifyBtn.classList.add('flash-active');
    
    // Vibrate and show toast
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    showSuccessToast("Alert System: Functional ✅");

    // Stop flash after 5 seconds
    setTimeout(() => {
        notifyBtn.classList.remove('flash-active');
    }, 5000);
}
