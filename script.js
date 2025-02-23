const dom = {
    lengthInput: document.getElementById('length'),
    numbersCheckbox: document.getElementById('numbers'),
    symbolsCheckbox: document.getElementById('symbols'),
    generateBtn: document.getElementById('generate-btn'),
    copyBtn: document.getElementById('copy-btn'),
    generatedPassword: document.getElementById('generated-password'),
    passwordInput: document.getElementById('password-input'),
    strengthResult: document.getElementById('strength-result'),
    strengthPhrases: document.getElementById('strength-phrases'),
    checkStrengthBtn: document.getElementById('check-strength-btn')
};

const charSets = {
    letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// Password generation with crypto-safe randomness
function generatePassword(length, useNumbers, useSymbols) {
    let chars = charSets.letters;
    if (useNumbers) chars += charSets.numbers;
    if (useSymbols) chars += charSets.symbols;

    const values = new Uint32Array(length);
    let password = '';

    // Use crypto API if available
    if (window.crypto?.getRandomValues) {
        window.crypto.getRandomValues(values);
        for (let i = 0; i < length; i++) {
            password += chars[values[i] % chars.length];
        }
    } else {
        // Fallback for older browsers
        for (let i = 0; i < length; i++) {
            password += chars[Math.floor(Math.random() * chars.length)];
        }
    }
    return password;
}

// Realistic strength calculation
function calculateEntropy(password) {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[\W_]/.test(password);
    const uniqueChars = new Set(password).size;

    // Calculate character set size
    let charset = 0;
    if (hasLower) charset += 26;
    if (hasUpper) charset += 26;
    if (hasNumber) charset += 10;
    if (hasSymbol) charset += 32;

    // Entropy formula: log2(charset^length)
    return Math.log2(Math.pow(charset || 1, password.length)) + (uniqueChars * 0.5);
}

function checkPasswordStrength(password) {
    const entropy = calculateEntropy(password);
    const guessesPerSecond = 1e11; // 100 billion guesses/second
    const seconds = Math.pow(2, entropy) / guessesPerSecond;

    let strength, timeToCrack;

    if (seconds < 1) {
        strength = 'Very Weak';
        timeToCrack = 'Instantly';
    } else if (seconds < 60) {
        strength = 'Weak';
        timeToCrack = `${Math.round(seconds)} seconds`;
    } else if (seconds < 3600) {
        strength = 'Medium';
        timeToCrack = `${Math.round(seconds/60)} minutes`;
    } else if (seconds < 86400) {
        strength = 'Strong';
        timeToCrack = `${Math.round(seconds/3600)} hours`;
    } else {
        strength = 'Very Strong';
        timeToCrack = `${Math.round(seconds/86400)} days+`;
    }

    // Penalize common patterns
    if (/password|123456|qwerty/i.test(password)) {
        strength = 'Very Weak';
        timeToCrack = 'Instantly';
    }

    return { strength, timeToCrack };
}

const wizardPhrases = {
    'Very Weak': [
        'This password would fail Magic 101!',
        'Even a goblin could crack this!',
        'Flimsier than a paper shield!',
        'About as secure as a wet tissue!',
        'A gust of wind could blow this away!',
        'This spell lacks any power!',
        'Worse than a simple "123456"!',
        'A baby dragon could break this!',
        'Not even apprentice-level security!',
        'This protection charm has failed!'
    ],
    'Weak': [
        'Mediocre magical protection!',
        'Could use some enchantment!',
        'Basic ward - needs improvement!',
        'A troll might struggle with this!',
        'Half-decent shielding spell!',
        'Novice-level security!',
        'Better than nothing, but barely!',
        'A determined ogre could breach this!',
        'Needs magical reinforcement!',
        'Basic charm - easily breakable!'
    ],
    'Medium': [
        'Decent magical shielding!',
        'Adequate for common threats!',
        'Standard protection charm!',
        'Would slow down most dark mages!',
        'Reasonable security incantation!',
        'Moderate defensive spell!',
        'Good enough for casual use!',
        'Requires some effort to break!',
        'Standard ward against minor demons!',
        'Acceptable for everyday magic!'
    ],
    'Strong': [
        'Powerful arcane protection!',
        'Impressive defensive magic!',
        'Worthy of a seasoned wizard!',
        'This would challenge a dark lord!',
        'Strong enough for royal vaults!',
        'A dragon might pause at this gate!',
        'Magical security of the highest order!',
        'This ward could stop a basilisk!',
        'Formidable protective enchantment!',
        'Security fit for a grand mage!'
    ],
    'Very Strong': [
        'Legendary arcane security!',
        'Unbreakable magical barrier!',
        'The gods themselves would approve!',
        'This ward could withstand Ragnarok!',
        'Elder dragon-level protection!',
        'Mythical-grade security spell!',
        'The stuff of magical legends!',
        'A phoenix would respect this defense!',
        'Divine-level protective charm!',
        'The ultimate in magical security!'
    ]
};

// Notification System (modified to handle error notifications)
const notification = document.createElement('div');
notification.className = 'notification';
document.body.appendChild(notification);

function showNotification(message, isError = false) {
    notification.textContent = message;
    notification.style.backgroundColor = isError ? '#ff4444' : '#444'; // Set background color dynamically
    notification.classList.toggle('error', isError); // Add/remove 'error' class for styling

    notification.style.opacity = '1';
    setTimeout(() => {
        notification.style.opacity = '0';
    }, isError ? 1500 : 2000); // Shorter fade for errors
}

function showErrorNotification(message) { // Separate function for errors, if needed for clarity
    showNotification(message, true); // Call showNotification with isError = true
}


// Event Handlers
dom.generateBtn.addEventListener('click', () => {
    let length = parseInt(dom.lengthInput.value);

    if (isNaN(length) || length < 8 || length > 30) {
        showErrorNotification("Password length must be between 8 and 30!"); // Use error notification
        return; // Stop password generation
    }

    length = Math.max(8, Math.min(30, length)); // Keep the Math.max/min for safety after parsing
    const password = generatePassword(
        length,
        dom.numbersCheckbox.checked,
        dom.symbolsCheckbox.checked
    );
    dom.generatedPassword.value = password;
});

dom.copyBtn.addEventListener('click', async () => {
    try {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(dom.generatedPassword.value);
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = dom.generatedPassword.value;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
        showNotification('Password copied to clipboard!');
    } catch (err) {
        showNotification('Failed to copy!', true); // Generic error notification
    }
});

dom.checkStrengthBtn.addEventListener('click', () => {
    const password = dom.passwordInput.value.trim();

    // Clear previous results
    dom.strengthResult.textContent = '';
    dom.strengthPhrases.textContent = '';

    if (!password) {
        dom.strengthResult.textContent = 'Please enter a password';
        return;
    }

    const { strength, timeToCrack } = checkPasswordStrength(password);
    const phrases = wizardPhrases[strength];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    dom.strengthResult.innerHTML = `<strong>${strength}</strong> (${timeToCrack})`;
    dom.strengthPhrases.textContent = `"${randomPhrase}"`;
});

// Tab Switching
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.dataset.tab;

        // Remove active classes
        document.querySelectorAll('.tab-button, .tab-content').forEach(el => {
            el.classList.remove('active');
        });

        // Add active classes
        button.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});


// Initial setup
document.getElementById('generator').classList.add('active');
document.querySelector('[data-tab="generator"]').classList.add('active');