/**
 * REWP Routine & Networking Module
 * March 2026 - South Africa Market Logic
 */

const TRIP_STEPS = [
    { id: 'step-load', label: '📦 Loading Cargo', min: 0 },
    { id: 'step-travel', label: '🚚 In Transit', min: 40 },
    { id: 'step-queue', label: '🚦 Yard Queue', min: 80 },
    { id: 'step-scale', label: '⚖️ Scaling/EFT', min: 95 },
    { id: 'step-paid', label: '✅ Payment Received', min: 100 }
];

let currentStepIndex = 0;

function updateNetworkingStep() {
    const progressFill = document.getElementById('goalFill');
    const goalText = document.getElementById('goalText');
    const trafficLabel = document.getElementById('trafficStatus');

    // Link Traffic to Travel Time
    let delayFactor = 1.0; 
    if (trafficLabel && trafficLabel.innerText.includes('High')) {
        delayFactor = 1.5; // 50% slower if traffic is heavy
    }

    const currentStep = TRIP_STEPS[currentStepIndex];
    
    // Update Progress Bar UI
    if (progressFill) {
        progressFill.style.width = `${currentStep.min}%`;
        progressFill.style.background = currentStepIndex === 4 ? '#00ff88' : '#007bff';
    }

    // Update Text Overlay
    if (goalText) {
        goalText.innerHTML = `
            <div style="display:flex; justify-content:space-between;">
                <span><strong>Status:</strong> ${currentStep.label}</span>
                <span>${currentStep.min}%</span>
            </div>
        `;
    }

   // Inside routine.js -> updateNetworkingStep()
if (currentStepIndex === 4) { // Payment Received Step
    const net = parseFloat(document.getElementById('netProfit').innerText.replace('R', '')) || 0;
    
    // Auto-allocate 10% to Fixed Investment Allowance
    let currentBank = parseFloat(localStorage.getItem('REWP_BankAllowance')) || 0;
    const investment = net * 0.10; 
    localStorage.setItem('REWP_BankAllowance', (currentBank + investment).toFixed(2));
    
    showSuccessToast(`R${investment.toFixed(2)} auto-saved to Investment Allowance`);
}

}

// Initialize the routine when the wallet opens
function startTripRoutine() {
    currentStepIndex = 0;
    updateNetworkingStep();
}
