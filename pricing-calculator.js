const ageLimits = {
    main: { min: 18, max: 65 },
    spouse: { min: 18, max: 65 },
    child: { min: 0, max: 17 },
    parent: { min: 30, max: 75 },
    extended: { min: 1, max: 75 }
};

let pricingTable;
let selectedCover = 'protectors';
let selectedProtector = 'education';
let selectedGender = 'male';

async function fetchPricingTable() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/pierre-design/experiments/main/pricing_table.xml');
        const text = await response.text();
        const parser = new DOMParser();
        pricingTable = parser.parseFromString(text, "text/xml");
        console.log("Pricing table loaded successfully");
        updatePremium(); // Call updatePremium after loading the pricing table
    } catch (error) {
        console.error("Error loading pricing table:", error);
    }
}

function selectCover(cover) {
    selectedCover = cover;
    document.querySelectorAll('.cover-options button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(cover).classList.add('active');
    if (cover === 'protectors') {
        document.getElementById('essential-diamond-options').style.display = 'none';
        document.getElementById('protectors-options').style.display = 'block';
    } else {
        document.getElementById('essential-diamond-options').style.display = 'block';
        document.getElementById('protectors-options').style.display = 'none';
        updateCoverOptions();
    }
    updatePremium();
}

function updateCoverOptions() {
    const coverAmountSelect = document.getElementById('cover-amount');
    coverAmountSelect.innerHTML = '';

    const coverAmounts = selectedCover === 'essential' ? [
        70000, 60000, 50000, 40000, 30000, 20000, 10000, 5000
    ] : [
        50000, 40000, 30000, 20000, 10000, 5000
    ];

    coverAmounts.forEach(amount => {
        const option = document.createElement('option');
        option.value = amount;
        option.textContent = 'R' + amount.toLocaleString();
        coverAmountSelect.appendChild(option);
    });

    coverAmountSelect.selectedIndex = 0;
    updatePremium(); // Call updatePremium after updating cover options
}

function selectProtector(protector) {
    selectedProtector = protector;
    document.querySelectorAll('.protector-block').forEach(block => block.classList.remove('active'));
    document.querySelectorAll('.protector-block').forEach(block => {
        if (block.querySelector('.label').textContent.toLowerCase() === protector) {
            block.classList.add('active');
        }
    });
    updatePremium();
}

function toggleGender() {
    const toggleSwitch = document.querySelector('.toggle-switch');
    if (selectedGender === 'male') {
        selectedGender = 'female';
        toggleSwitch.setAttribute('data-gender', 'female');
        document.getElementById('male').classList.remove('active');
        document.getElementById('female').classList.add('active');
    } else {
        selectedGender = 'male';
        toggleSwitch.setAttribute('data-gender', 'male');
        document.getElementById('male').classList.add('active');
        document.getElementById('female').classList.remove('active');
    }
    updatePremium();
}

function limitAge(input) {
    input.value = input.value.replace(/\D/g, '');
    let age = parseInt(input.value, 10);
    if (isNaN(age)) {
        input.value = '';
    } else if (age < 0) {
        input.value = '0';
    } else if (age > 99) {
        input.value = '99';
    } else if (input.value.length > 2) {
        input.value = input.value.slice(-2);
    }
}

function checkAgeLimits() {
    const role = document.getElementById('role').value;
    const age = parseInt(document.getElementById('age').value);
    const ageInput = document.getElementById('age');
    const errorLabel = document.getElementById('error-label');

    if (age < ageLimits[role].min) {
        ageInput.classList.add('error');
        errorLabel.textContent = 'Too young';
        errorLabel.style.display = 'block';
    } else if (age > ageLimits[role].max) {
        ageInput.classList.add('error');
        errorLabel.textContent = 'Too old';
        errorLabel.style.display = 'block';
    } else {
        ageInput.classList.remove('error');
        errorLabel.style.display = 'none';
    }
}

function toggleCoverOptions() {
    const role = document.getElementById('role').value;
    const protectorsButton = document.getElementById('protectors');
    const protectorsDivider = document.getElementById('protectors-divider');

    if (role !== 'main') {
        protectorsButton.style.display = 'none';
        protectorsDivider.style.display = 'none';
        document.getElementById('essential').style.width = 'calc(50% - 6px)';
        document.getElementById('diamond').style.width = 'calc(50% - 6px)';
        if (selectedCover === 'protectors') {
            selectCover('essential');
        }
    } else {
        protectorsButton.style.display = 'block';
        protectorsDivider.style.display = 'block';
        document.getElementById('essential').style.width = 'calc(33.33% - 4px)';
        document.getElementById('diamond').style.width = 'calc(33.33% - 4px)';
        document.getElementById('protectors').style.width = 'calc(33.33% - 4px)';
    }
}

function updatePremium() {
    checkAgeLimits();
    const role = document.getElementById('role').value;
    const age = parseInt(document.getElementById('age').value);
    const gender = selectedGender;
    let premium = 0;
    let isError = false;

    if (!pricingTable) {
        console.log("Pricing table not loaded yet");
        isError = true;
    }

    console.log(`Updating premium for role: ${role}, age: ${age}, gender: ${gender}, cover: ${selectedCover}`);

    if (!isError) {
        const roleNode = pricingTable.querySelector(`role[name="${role}"]`);
        if (!roleNode) {
            console.error(`Role "${role}" not found in pricing table`);
            isError = true;
        }

        if (!isError) {
            const genderNode = roleNode.querySelector(`gender[type="${gender}"]`);
            if (!genderNode) {
                console.error(`Gender "${gender}" not found for role "${role}"`);
                isError = true;
            }

            if (!isError) {
                const ageNode = genderNode.querySelector(`age[value="${age}"]`);
                if (!ageNode) {
                    console.error(`Age "${age}" not found for role "${role}" and gender "${gender}"`);
                    isError = true;
                }

                if (!isError) {
                    const coverOptionNode = ageNode.querySelector(`cover_option[type="${selectedCover}"]`);
                    if (!coverOptionNode) {
                        console.error(`Cover option "${selectedCover}" not found for age "${age}"`);
                        isError = true;
                    }

                    if (!isError) {
                        if (selectedCover === 'protectors') {
                            const protectorNode = coverOptionNode.querySelector(`protectors[type="${selectedProtector}"]`);
                            if (protectorNode) {
                                const coverNode = protectorNode.querySelector('cover');
                                if (coverNode) {
                                    premium = parseFloat(coverNode.textContent);
                                } else {
                                    console.error(`Cover not found for protector "${selectedProtector}"`);
                                    isError = true;
                                }
                            } else {
                                console.error(`Protector "${selectedProtector}" not found for age "${age}"`);
                                isError = true;
                            }
                        } else {
                            const coverAmount = document.getElementById('cover-amount').value;
                            console.log(`Searching for cover amount: ${coverAmount} in ${selectedCover} cover`);
                            const coverNode = coverOptionNode.querySelector(`cover[type="${coverAmount}"]`);
                            if (coverNode) {
                                premium = parseFloat(coverNode.textContent);
                            } else {
                                console.error(`Cover amount "${coverAmount}" not found for ${selectedCover} cover`);
                                // Fallback: use the first available cover amount
                                const firstCoverNode = coverOptionNode.querySelector('cover');
                                if (firstCoverNode) {
                                    premium = parseFloat(firstCoverNode.textContent);
                                    console.log(`Fallback to first available cover amount: ${firstCoverNode.getAttribute('type')}`);
                                } else {
                                    isError = true;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    console.log(`Calculated premium: R${premium.toFixed(2)}`);

    // Update the total amount and show the appropriate icon with transition
    const totalElement = document.getElementById('total');
    const checkmarkIcon = document.getElementById('total-icon');
    const errorIcon = document.getElementById('error-icon');

    totalElement.textContent = isError ? 'Try Again' : `R${premium.toFixed(2)} pm`;

    // Clear any existing timeouts
    if (window.updatePremiumTimeout) {
        clearTimeout(window.updatePremiumTimeout);
    }

    // Reset scale for icons and opacity for total
    checkmarkIcon.style.transition = 'none';
    errorIcon.style.transition = 'none';
    totalElement.style.transition = 'none';
    checkmarkIcon.style.transform = 'scale(0)';
    errorIcon.style.transform = 'scale(0)';
    totalElement.style.opacity = '0';

    // Force a reflow to ensure the transition runs again
    void totalElement.offsetWidth;
    void checkmarkIcon.offsetWidth;
    void errorIcon.offsetWidth;

    // Re-enable transitions
    checkmarkIcon.style.transition = '';
    errorIcon.style.transition = '';
    totalElement.style.transition = '';

    // Set the final styles to trigger the transition after a small delay
    window.updatePremiumTimeout = setTimeout(() => {
        if (isError) {
            errorIcon.style.display = 'block';
            checkmarkIcon.style.display = 'none';
            errorIcon.style.transform = 'scale(1)';
            totalElement.classList.add('error');
        } else {
            checkmarkIcon.style.display = 'block';
            errorIcon.style.display = 'none';
            checkmarkIcon.style.transform = 'scale(1)';
            totalElement.classList.remove('error');
        }
        totalElement.style.opacity = '1';
    }, 50);
}

// Export functions that need to be accessed from HTML
window.selectCover = selectCover;
window.selectProtector = selectProtector;
window.toggleGender = toggleGender;
window.limitAge = limitAge;
window.checkAgeLimits = checkAgeLimits;
window.toggleCoverOptions = toggleCoverOptions;
window.updatePremium = updatePremium;

// Initialize the calculator
document.addEventListener('DOMContentLoaded', () => {
    selectCover('protectors');
    selectProtector('education');
    updateCoverOptions();
    toggleCoverOptions();
    fetchPricingTable();
});
