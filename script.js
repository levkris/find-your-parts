// Function to fetch parts data from JSON file
async function fetchPartsData() {
    const response = await fetch('parts_data.json');
    return await response.json();
}

// Function to render parts on the page
function renderParts(parts) {
    const partContainer = document.getElementById('partContainer');
    partContainer.innerHTML = ''; // Clear previous content
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
    const overlay = document.getElementById('overlay');
    
    confirmationMessage.innerHTML = "Are you sure you want to grab:<br>" + partName + "?";
    confirmationBox.style.display = 'block';
    overlay.style.display = 'block'; // Show the overlay
}

function hideConfirmationBox() {
    const confirmationBox = document.getElementById('confirmationBox');
    const overlay = document.getElementById('overlay');
    
    confirmationBox.style.display = 'none';
    overlay.style.display = 'none'; // Hide the overlay
}

const overlay = document.getElementById('overlay');
overlay.addEventListener('click', hideConfirmationBox);

// Function to grab part
function grabPart() {
    hideConfirmationBox();
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

  // Fetch signal strength from the server
  fetch('/signal_strength')
    .then(response => response.json())
    .then(data => {
      console.log("Signal Strength (Server Device):", data.signal_strength);
    })
    .catch(error => {
      console.error("Error fetching signal strength:", error);
    });