// --- DOM Element Selectors ---
//  These lines select various HTML elements using their IDs and store them in the 'dom' object.
//  This makes it easier to access and manipulate these elements in the JavaScript code.
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

// --- Character Sets Definition ---
//  This object defines the character sets that can be used to generate passwords.
//  'letters' includes uppercase and lowercase alphabets, 'numbers' includes digits, and 'symbols' includes common symbols.
const charSets = {
    letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// --- Password Generation Function ---
//  This function generates a random password based on the specified length and character set options.
//  It uses cryptographically secure methods if available, falling back to standard Math.random() if not.
function generatePassword(length, useNumbers, useSymbols) {
    let chars = charSets.letters; // Start with letters as the base character set
    if (useNumbers) chars += charSets.numbers; // Add numbers if the 'useNumbers' option is true
    if (useSymbols) chars += charSets.symbols; // Add symbols if the 'useSymbols' option is true

    const values = new Uint32Array(length); // Create an array to hold random values for password generation
    let password = ''; // Initialize an empty string to store the generated password

    // Use crypto API for secure random values if available in the browser
    if (window.crypto?.getRandomValues) {
        window.crypto.getRandomValues(values); // Fill the 'values' array with cryptographically secure random numbers
        for (let i = 0; i < length; i++) {
            password += chars[values[i] % chars.length]; // Select a random character from 'chars' based on the random value and append to the password
        }
    } else {
        // Fallback for older browsers that do not support crypto API
        for (let i = 0; i < length; i++) {
            password += chars[Math.floor(Math.random() * chars.length)]; // Select a random character from 'chars' using Math.random() and append to the password
        }
    }
    return password; // Return the generated password string
}

// --- Password Entropy Calculation Function ---
//  This function calculates the entropy of a password, which is a measure of its randomness and unpredictability.
//  Higher entropy generally means a stronger password.
function calculateEntropy(password) {
    const hasLower = /[a-z]/.test(password); // Check if password contains lowercase letters
    const hasUpper = /[A-Z]/.test(password); // Check if password contains uppercase letters
    const hasNumber = /\d/.test(password);    // Check if password contains numbers
    const hasSymbol = /[\W_]/.test(password);  // Check if password contains symbols (non-alphanumeric characters)
    const uniqueChars = new Set(password).size; // Count the number of unique characters in the password

    // Calculate the size of the character set used in the password
    let charset = 0;
    if (hasLower) charset += 26;  // Add 26 for lowercase letters
    if (hasUpper) charset += 26;  // Add 26 for uppercase letters
    if (hasNumber) charset += 10;  // Add 10 for numbers
    if (hasSymbol) charset += 32;  // Add 32 for symbols (approximate)

    // Entropy formula: log2(charset^length) + (uniqueChars * 0.5) - A measure of password strength
    return Math.log2(Math.pow(charset || 1, password.length)) + (uniqueChars * 0.5);
}

// --- Password Strength Check Function ---
//  This function checks the strength of a given password based on its entropy.
//  It estimates the time to crack and categorizes the strength into levels (Very Weak, Weak, etc.).
function checkPasswordStrength(password) {
    const entropy = calculateEntropy(password); // Calculate the entropy of the password
    const guessesPerSecond = 1e11; // 100 billion guesses/second - Estimated guessing speed of a cracker
    const seconds = Math.pow(2, entropy) / guessesPerSecond; // Estimate time to crack in seconds

    let strength, timeToCrack; // Variables to store password strength level and time to crack

    // Categorize password strength based on estimated cracking time
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

    // Penalize common password patterns (like "password", "123456", "qwerty")
    if (/password|123456|qwerty/i.test(password)) {
        strength = 'Very Weak';
        timeToCrack = 'Instantly';
    }

    return { strength, timeToCrack }; // Return an object containing the strength level and time to crack
}

// --- Wizard-Themed Phrases for Strength Levels ---
//  This object contains arrays of fun, wizard-themed phrases associated with different password strength levels.
//  These phrases are displayed to the user to make the strength check more engaging.
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

// --- Notification System ---
//  Creates a notification element and appends it to the body.
const notification = document.createElement('div');
notification.className = 'notification';
document.body.appendChild(notification);

// Function to display notifications (success or error)
function showNotification(message, isError = false) {
    notification.textContent = message; // Set the notification message
    notification.style.backgroundColor = isError ? '#ff4444' : '#444'; // Set background color based on error status (red for error, grey for success)
    notification.classList.toggle('error', isError); // Add or remove 'error' class for styling (red error notification)

    notification.style.opacity = '1'; // Make the notification visible
    setTimeout(() => {
        notification.style.opacity = '0'; // Fade out the notification after a delay
    }, isError ? 1500 : 2000); // Shorter fade-out for error messages
}

// Function specifically for showing error notifications (for clarity)
function showErrorNotification(message) {
    showNotification(message, true); // Call showNotification with 'isError' set to true to display as an error
}

// --- Event Listener for "Generate Password" Button ---
//  When the "Generate Password" button is clicked, this code runs to generate and display a new password.
dom.generateBtn.addEventListener('click', () => {
    let length = parseInt(dom.lengthInput.value); // Get the desired password length from the input field and convert to a number

    // Input validation: Check if the length is a valid number between 8 and 30
    if (isNaN(length) || length < 8 || length > 30) {
        showErrorNotification("Password length must be between 8 and 30!"); // Show error notification if length is invalid
        return; // Stop the function execution if input is invalid
    }

    length = Math.max(8, Math.min(30, length)); // Ensure length is within the valid range (8-30) using Math.max and Math.min for safety
    const password = generatePassword( // Generate a new password using the generatePassword function
        length, // Password length
        dom.numbersCheckbox.checked, // Include numbers option (from checkbox)
        dom.symbolsCheckbox.checked  // Include symbols option (from checkbox)
    );
    dom.generatedPassword.value = password; // Set the generated password in the read-only input field
});

// --- Event Listener for "Copy to Clipboard" Button ---
//  When the "Copy to Clipboard" button is clicked, this code copies the generated password to the clipboard.
dom.copyBtn.addEventListener('click', async () => {
    try {
        // Use the modern Clipboard API if available
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(dom.generatedPassword.value); // Asynchronously write the password to the clipboard
        } else {
            // Fallback for older browsers that do not support Clipboard API
            const textarea = document.createElement('textarea'); // Create a temporary textarea element
            textarea.value = dom.generatedPassword.value; // Set the textarea value to the generated password
            document.body.appendChild(textarea); // Append the textarea to the document body (not visible)
            textarea.select(); // Select the text in the textarea
            document.execCommand('copy'); // Execute the deprecated 'copy' command to copy selected text
            document.body.removeChild(textarea); // Remove the temporary textarea from the document
        }
        showNotification('Password copied to clipboard!'); // Show success notification
    } catch (err) {
        showNotification('Failed to copy!', true); // Show error notification if copying fails
    }
});

// --- Event Listener for "Check Strength" Button ---
//  When the "Check Strength" button is clicked, this code checks and displays the strength of the entered password.
dom.checkStrengthBtn.addEventListener('click', () => {
    const password = dom.passwordInput.value.trim(); // Get the password from the input field and remove leading/trailing whitespace

    // Clear previous strength results and phrases
    dom.strengthResult.textContent = '';
    dom.strengthPhrases.textContent = '';

    // Check if the password input is empty
    if (!password) {
        dom.strengthResult.textContent = 'Please enter a password'; // Display message if no password is entered
        return; // Stop function execution
    }

    const { strength, timeToCrack } = checkPasswordStrength(password); // Check password strength and get strength level and time to crack
    const phrases = wizardPhrases[strength]; // Get the array of wizard phrases for the determined strength level
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)]; // Select a random phrase from the array

    dom.strengthResult.innerHTML = `<strong>${strength}</strong> (${timeToCrack})`; // Display strength level and time to crack in the strengthResult element (using bold for strength)
    dom.strengthPhrases.textContent = `"${randomPhrase}"`; // Display the random wizard phrase in the strengthPhrases element
});

// --- Tab Switching Logic ---
//  This section handles switching between the "Generator" and "Strength Check" tabs.
//  It adds event listeners to each tab button to show the corresponding tab content and hide others.
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.dataset.tab; // Get the tab name from the 'data-tab' attribute of the clicked button

        // Remove 'active' class from all tab buttons and tab content elements
        document.querySelectorAll('.tab-button, .tab-content').forEach(el => {
            el.classList.remove('active');
        });

        // Add 'active' class to the clicked tab button and the corresponding tab content element
        button.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// --- Initial Setup ---
//  This section sets the "Generator" tab as active by default when the page loads.
document.getElementById('generator').classList.add('active'); // Make the 'generator' tab content visible
document.querySelector('[data-tab="generator"]').classList.add('active'); // Make the 'generator' tab button visually active