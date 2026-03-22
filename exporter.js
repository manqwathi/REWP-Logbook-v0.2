/**
 * REWP Exporter Module - Updated March 2026
 * Fixed: Double-loop error & URI encoding
 * Added: 15% REWP Emergency Contribution deduction
 */
function exportToCSV() {
    // Check if inventory exists and has data
    if (typeof inventory === 'undefined' || inventory.length === 0) {
        return alert("No logs to export!");
    }

    // 1. Get financial values (Cleaned of "R" and formatting)
    const getVal = (id) => document.getElementById(id).innerText.replace(/[^\d.-]/g, '');
    const gross = parseFloat(getVal('gross')) || 0;
    const travel = parseFloat(getVal('travel')) || 0;
    
    // 2. Calculate REWP Emergency Contribution (15%)
    const rewpContribution = (gross * 0.15).toFixed(2);
    const netProfit = (gross - travel - rewpContribution).toFixed(2);

    // 3. Build CSV Content
    let csvRows = [];
    csvRows.push("REWP LOGBOOK EXPORT");
    csvRows.push(`Export Date,${new Date().toLocaleDateString()}`);
    csvRows.push(""); // Spacer
    csvRows.push("Time,Material,Weight (kg),Rate (R/kg),Total (R)");

    // Single loop for inventory data
    inventory.forEach(i => {
        const rowTotal = (i.weight * i.rate).toFixed(2);
        csvRows.push(`${i.time},"${i.name}",${i.weight},${i.rate},${rowTotal}`);
    });

    // 4. Add Financial Footer with 15% Deduction
    csvRows.push("");
    csvRows.push("FINANCIAL SUMMARY");
    csvRows.push(`Gross Revenue,R ${gross.toFixed(2)}`);
    csvRows.push(`Travel Costs,R ${travel.toFixed(2)}`);
    csvRows.push(`REWP Emergency Contribution (15%),R ${rewpContribution}`);
    csvRows.push(`Final Net Profit,R ${netProfit}`);

    // 5. Create Blob and Download (Safer than encodeURI for large files)
    const csvString = csvRows.join("\r\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, `REWP_Report_${new Date().toISOString().slice(0,10)}.csv`);
    } else {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `REWP_Report_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    if (typeof showSuccessToast === "function") {
        showSuccessToast("Financial Report Downloaded");
    }
}
function updateFinancials() {
    let totalGross = 0;
    
    // Calculate gross from your inventory array
    inventory.forEach(item => {
        totalGross += (item.weight * item.rate);
    });

    // Get current travel costs from your input or UI
    const travelVal = parseFloat(document.getElementById('travel').innerText.replace(/[^\d.-]/g, '')) || 0;

    // Calculate the 15% REWP Share
    const rewpShare = totalGross * 0.15;
    const finalNet = totalGross - travelVal - rewpShare;

    // Update the UI Labels
    document.getElementById('gross').innerText = `R ${totalGross.toFixed(2)}`;
    document.getElementById('rewp-deduction').innerText = `R ${rewpShare.toFixed(2)}`;
    document.getElementById('netProfit').innerText = `R ${finalNet.toFixed(2)}`;
}
function previewReport() {
    // 1. Get values safely
    const grossVal = document.getElementById('gross').innerText;
    const travelVal = document.getElementById('travel').innerText;
    const netVal = document.getElementById('netProfit').innerText;
    const rewpVal = document.getElementById('rewp-deduction').innerText;
    
    // Create a unique Transaction ID for the 15% contribution
    const txID = "REWP-" + Math.random().toString(36).substr(2, 6).toUpperCase();

    // 2. Build the text string
    let previewText = `ID: ${txID}\nDATE: ${new Date().toLocaleDateString()}\n`;
    previewText += `--------------------------\n`;
    
    // Loop through inventory (ensure 'inventory' exists in your global scope)
    if (window.inventory && inventory.length > 0) {
        inventory.forEach(i => {
            previewText += `${i.name.padEnd(10)}: ${i.weight}kg @ R${i.rate}\n`;
        });
    } else {
        previewText += "No items in logbook.\n";
    }

    previewText += `--------------------------\n`;
    previewText += `GROSS:     ${grossVal}\n`;
    previewText += `TRAVEL:    ${travelVal}\n`;
    previewText += `REWP (15%): ${rewpVal}\n`;
    previewText += `NET PAYOUT: ${netVal}\n`;

    // 3. Inject and Display
    const contentDiv = document.getElementById('previewContent');
    const modal = document.getElementById('previewModal');
    
    contentDiv.innerText = previewText;
    modal.style.display = 'flex'; // Use flex to trigger the centering
}

function handleSignature(checkbox) {
    const exportBtn = document.getElementById('exportBtn');
    exportBtn.disabled = !checkbox.checked;
    exportBtn.style.opacity = checkbox.checked ? "1" : "0.5";
}
