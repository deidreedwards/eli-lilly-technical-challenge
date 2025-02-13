document.addEventListener('DOMContentLoaded', () => {
    const main = document.querySelector('main');
    
    // Create a simple container for our medicines
    const medicineList = document.createElement('div');
    medicineList.id = 'medicineList';
    main.appendChild(medicineList);

    // Function to fetch medicines from API
    async function fetchMedicines() {
        try {
            const response = await fetch('http://localhost:8000/medicines');
            const data = await response.json();
            displayMedicines(data.medicines);
        } catch (error) {
            console.error('Error:', error);
            medicineList.innerHTML = 'Error loading medicines';
        }
    }

    // Function to display medicines on site
    function displayMedicines(medicines) {
       medicineList.innerHTML = ''; // Avoids duplicates
        
        medicines.forEach(medicine => {
            const medicineElement = document.createElement('div');
            medicineElement.className = 'medicine-item';
            medicineElement.innerHTML = `
                <p>Name: ${medicine.name}</p>
                <p>Price: $${medicine.price}</p>
            `;
            medicineList.appendChild(medicineElement);
        });
    }

    // Calling function to fetch medicines
    fetchMedicines();
});