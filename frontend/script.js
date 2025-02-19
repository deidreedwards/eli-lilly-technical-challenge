document.addEventListener('DOMContentLoaded', () => {
    const main = document.querySelector('main');
    
    // Container for medicines
    const medList = document.createElement('div')
    const statusMessage = document.getElementById('statusMessage')
    medList.id = 'medicineList';
    main.appendChild(medList);


    // Function to fetch medicines from API
    async function fetchMedicines() {
        try {
            //statusMessage.textContent = "Medicines loading"
            //statusMessage.className = 'status-message status-loading'
            const response = await fetch('http://localhost:8000/medicines');
            const data = await response.json();

            if(!data || !data.medicines) {
                throw new Error('Unexpected API response format')
            }

            displayMedicines(data.medicines);
            statusMessage.textContent = ''
            statusMessage.className = 'status-message'

        } catch (error) {
            console.error('Error:', error);
            statusMessage.textContent = 'Error loading medicines. Please try again later.';
            statusMessage.className = 'status- message status-error';
            medList.innerHTML = '';
        }
    }

    // Function to display medicines on site
    function displayMedicines(medicines) {
       medList.innerHTML = '';
        
       // Check if medicines array is empty
       if (!Array.isArray(medicines) || medicines.length === 0) {
        medList.innerHTML = '<p>No medicines found in database.</p>';
        return;
    }
        medicines.forEach(medicine => {
            const hasName = Boolean(medicine.name);
            const hasPrice = Boolean(medicine.price) && !isNaN(medicine.price);

            const name = hasName ? medicine.name : 'Unknown Medicine';
            const price = hasPrice ? parseFloat(medicine.price) : 0;

            const medicineElement = document.createElement('div');
            medicineElement.className = 'medicine-item';

            const isIncomplete = !hasName || !hasPrice;
            if (isIncomplete) {
                medicineElement.classList.add('medicine-incomplete');
            }

            let warningButton = '';
            if (isIncomplete) {
                const missing = !hasName && !hasPrice ? 'Name and Price' : 
                                !hasName ? 'Name' : 'Price';
                warningButton = `
                    <button class="warning-button" title="Missing: ${missing}">
                    ⚠️ Missing Data
                    </button>
                `;
            }
            medicineElement.innerHTML = `
                <p>Name: ${name}</p>
                <p>Price: $${price.toFixed(2)}</p>
                ${warningButton}
            `;
            medList.appendChild(medicineElement);
        });
    }
    // Calling function to fetch medicines
    fetchMedicines();
});