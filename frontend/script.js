document.addEventListener('DOMContentLoaded', () => {
    const main = document.querySelector('main');

    //Function checks validity of medicine names and prices
    const validateMedicineData = (medicine) => {
        const isValid = {
            name: typeof medicine.name === 'string' && medicine.name.trim() !== '',
            price: !isNaN(parseFloat(medicine.price)) && medicine.price >= 0
        };
        return {
            name: isValid.name ? medicine.name.trim() : 'Unknown Medicine',
            price: isValid.price ? parseFloat(medicine.price) : 0,
            isComplete: isValid.name && isValid.price
        };
    };

    //Function to create medicine list and "Add Medicine" form
    const createUI = () => {
        const listSection = document.createElement('section');
        listSection.className = 'medicine-list';
        listSection.innerHTML = `
        <h2>Medicine List</h2>
        <div id = "medicineContainer"></div>
        <div id = "errorContainer" class = "error-container"></div>
        `;

        const formSection = document.createElement('section');
        formSection.className = 'medicine-form';
        formSection.innerHTML = `
            <h2>Add New Medicine</h2>
            <form id = "addMedicineForm">
                <input type = "text" id = "medicineName" required placeholder = "Enter medicine name">
                <input type = "number" id = "medicinePrice" step = "0.01" min = "0" required placeholder = "Enter price">
                <button type = "submit" class = "submit-button">Add Medicine</button>
            </form>
        `;

        main.appendChild(listSection);
        main.appendChild(formSection);
    };

    // Function to fetch medicines from API
    const fetchMedicines = async () => {
        try {
            const response = await fetch('http://localhost:8000/medicines');
            if (!response.ok) {
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }
            const data = await response.json();

            if(!data || !Array.isArray(data.medicines)) {
                throw new Error('Unexpected API response format')
            }

            displayMedicines(data.medicines);

        } catch (error) {
            console.error('Error fetching medicines:', error);
            showError('Error loading medicines. Please try again later.');
            displayMedicines([]);
        }
    };

    // Function to display medicines
    const displayMedicines = (medicines) => {
        const container = document.getElementById('medicineContainer');
        container.innerHTML = '';
        
       // Check if medicines array is empty
       if (!medicines || medicines.length === 0) {
            container.innerHTML = `
            <div class = "empty-state">
                <p>No medicines available at the moment.</p>
                <p>Try adding a new medicine using the form.</p>
            </div>
            `;
            return;
        }

        const sortedMedicines = [...medicines].sort((a, b) => {
            if (!a.name) return 1;
            if (!b.name) return -1;

            return a.name.localeCompare(b.name);
        });

        //Goes through each medicine in array and checks it
        sortedMedicines.forEach(medicine => {
            const validatedMed = validateMedicineData(medicine);
            const medicineCard = document.createElement('div');
            medicineCard.className = `medicine-card ${validatedMed.isComplete ? '' : 'incomplete-data'}`;
            medicineCard.innerHTML = `
                <h3>${validatedMed.name}</h3>
                <p>Price: $${validatedMed.price.toFixed(2)}</p>
                ${!validatedMed.isComplete ? '<p class = "warning"> Incomplete data</p>' : ''}
                <div class = "card-actions">
                    <button onclick = "updateMedicine('${validatedMed.name}')"
                            ${!validatedMed.isComplete ? 'disabled' : ''}>Update</button>
                    <button onclick = "deleteMedicine('${validatedMed.name}')"
                            class = "delete-btn"
                            ${!validatedMed.isComplete ? 'disabled' : ''}>Delete</button>
                </div>
            `;
            container.appendChild(medicineCard);
        });
    };

    //Function to add new medicines
    const addMedicine = async (event) => {
        event.preventDefault();

        const name = document.getElementById('medicineName').value.trim();
        const price = document.getElementById('medicinePrice').value;
        if (!name || name.length < 1) {
            showError('Please enter a valid medicine name');
            return;
        }

        if (!price || isNaN(price) || price < 0) {
            showError('Please enter a valid price');
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);

        try {
            const response = await fetch('http://localhost:8000/create', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.message) {
                showSuccess(data.message);
                fetchMedicines();
                event.target.reset();
            } else {
                throw new Error('Invalid response from server');
            }
            
        } catch (error) {
            console.error('Error adding medicine:', error);
            showError('Failed to add medicine. Please try again.');
        }
    };

    //Function to delete medicine
    window.deleteMedicine = async (name) => {
        if (!name || typeof name !== 'string') {
            showError('Invalid medicine name');
            return;
        }

        if (!confirm(`Are you sure you want to delete ${name}?`)) return;

        const formData = new FormData();
        formData.append('name', name);

        try {
            const response = await fetch('http://localhost:8000/delete', {
                method: 'DELETE',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.message) {
                showSuccess(data.message);
                fetchMedicines();
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Error deleteing medicine:', error);
            showError(`Failed to delete ${name}. Please try again.`);
        }
    };

    //Function to update medicine price
    window.updateMedicine = async (name) => {
        if (!name || typeof name !== 'string') {
            showError('Invalid medicine name');
            return;
        }

        const newPrice = prompt(`Enter new price for ${name}:`);
        if (!newPrice) return;

        const price = parseFloat(newPrice);
        if (isNaN(price) || price < 0) {
            showError('Please enter a valid price (must be a positive number)');
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);

        try {
            const response = await fetch('http://localhost:8000/update', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.message) {
                showSuccess(data.message);
                fetchMedicines();
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Error updating medicine:', error);
            showError(`Failed to update ${name}. Please try again.`);
        }

    };

    const showSuccess = (message) => {
        const container = document.createElement('div');
        container.className = 'notification success';
        container.textContent = message;
        showNotification(container);
    };

    const showError = (message) => {
        const container = document.createElement('div');
        container.className = 'notification error';
        container.textContent = message;
        showNotification(container);
    };

    const showNotification = (container) => {
        document.body.appendChild(container);
        setTimeout(() => {
            container.classList.add('fade-out');
            setTimeout(() => container.remove(), 500);
        }, 3000);
    };
    
    // Initialisation
    createUI();
    fetchMedicines();


    document.getElementById('addMedicineForm').addEventListener('submit', addMedicine);

});