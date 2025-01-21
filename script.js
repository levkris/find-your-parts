// Function to fetch parts data from JSON file
async function fetchPartsData() {
    const response = await fetch('parts_data.json');
    return await response.json();
}

// Function to render parts on the page
function renderParts(parts) {
    const partContainer = document.getElementById('partContainer');
    const itemsCountText = document.getElementById('itemCount');
    partContainer.innerHTML = ''; // Clear previous content

    const itemsCount = parts.length;

    itemsCountText.innerText = `${itemsCount} Items`;

    parts.forEach(part => {
        const partElement = document.createElement('div');
        partElement.classList.add('part');
        partElement.innerHTML = `
            <h3>${part.name}</h3>
            ${part.image_path ? `<img src="${part.image_path}" alt="${part.name}">` : ''}
            <p>In Stock: ${part.count}</p>
            <button class="grab-button" onclick="showConfirmationBox('${part.name}')">Grab Part</button>
        `;
        partContainer.appendChild(partElement);
    });
}

function showConfirmationBox(partName) {
    const confirmationBox = document.getElementById('confirmationBox');
    const confirmationMessage = document.getElementById('confirmationMessage');
    
    confirmationMessage.innerHTML = "Are you sure you want to grab:<br>" + partName + "?";
    confirmationBox.style.display = 'block';
}

function hideConfirmationBox() {
    const confirmationBox = document.getElementById('confirmationBox');
    
    confirmationBox.style.display = 'none';

    confirmationBox.innerHTML = `
        <h2 id="confirmationMessage"></h2>
        <div class="confirmation-buttons">
            <button class="confirmation-button" onclick="grabPart()">Yes!</button>
            <button class="confirmation-button" onclick="hideConfirmationBox()">No</button>
        </div>
    `;
}

// Function to grab part
function grabPart() {
    const confirmationBox = document.getElementById('confirmationBox');

    confirmationBox.innerHTML = `
        <img class="animation" src="./animations/grab-part.gif" draggable="false">
        <p>Grabbing part...</p>
        <div class="confirmation-buttons">
            <button class="confirmation-button" onclick="hideConfirmationBox()">Close</button>
        </div>
    `;

}

// Function to filter parts based on search input
async function filterParts(input) {
    const parts = await fetchPartsData();
    const searchTerm = input.toLowerCase();
    const filteredParts = parts.filter(part => part.name.toLowerCase().includes(searchTerm));
    renderParts(filteredParts);
}

// Event listener for search input
document.getElementById('searchInput').addEventListener('input', function(event) {
    filterParts(event.target.value);
});

// Function to sort parts based on selected option
function sortParts(option) {
    fetchPartsData().then(parts => {
        let sortedParts = [...parts]; // Create a copy of parts array
        switch(option) {
            case 'nameAsc':
                sortedParts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'nameDesc':
                sortedParts.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'countAsc':
                sortedParts.sort((a, b) => a.count - b.count);
                break;
            case 'countDesc':
                sortedParts.sort((a, b) => b.count - a.count);
                break;
        }
        renderParts(sortedParts);
    });
}

// Event listener for sort option change
document.getElementById('sortOption').addEventListener('change', function(event) {
    sortParts(event.target.value);
});

window.onload = async function() {
    const partsData = await fetchPartsData();
    renderParts(partsData);

    // Request server to update data when the page is loaded or refreshed
    fetch('/update_data')
        .then(response => response.text())
        .catch(error => console.error('Error updating data:', error));
};

// Fetch signal strength and Ethernet status from the server every 20 seconds
setInterval(async () => {
    try {
        const response = await fetch('/signal_strength');
        const data = await response.json();

        console.log(data);

        // Extract Wi-Fi signal strength and Ethernet status
        const signalStrength = data.signal_strength;
        const ethernetStatus = data.ethernet_status;
        const wifiIcon = document.querySelector('.wifi-icon');

        // Check if Ethernet is in use
        if (ethernetStatus.in_use) {
            wifiIcon.textContent = 'settings_ethernet';
            return; // Skip Wi-Fi signal logic
        }

        // Regex to extract signal level from the Wi-Fi signal data
        const regex = /Signal level=(-?\d+) dBm/;
        const match = signalStrength.match(regex);

        if (match) {
            const signalLevel = parseInt(match[1], 10);

            // Update Wi-Fi icon based on signal strength
            if (signalLevel >= -50) {
                wifiIcon.textContent = 'signal_wifi_4_bar';
            } else if (signalLevel >= -60) {
                wifiIcon.textContent = 'network_wifi_3_bar';
            } else if (signalLevel >= -70) {
                wifiIcon.textContent = 'network_wifi_2_bar';
            } else if (signalLevel >= -80) {
                wifiIcon.textContent = 'network_wifi_1_bar';
            } else {
                wifiIcon.textContent = 'signal_wifi_0_bar';
            }
        } else {
            console.error("Unable to parse Wi-Fi signal strength:", signalStrength);
        }
    } catch (error) {
        console.error("Error fetching signal strength:", error);
    }
}, 20000);

