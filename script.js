document.addEventListener('DOMContentLoaded', () => {
    const themeSelect = document.getElementById('theme-select');
    
    themeSelect.addEventListener('change', () => {
        const selectedTheme = themeSelect.value;
        
        document.body.classList.remove(
            'theme-blue', 
            'theme-purple', 
            'theme-green', 
            'theme-orange',
            'theme-red',
            'theme-pink',
            'theme-white',
            'theme-yellow'
        );
        
        if (selectedTheme !== 'blue') {
            document.body.classList.add(`theme-${selectedTheme}`);
        }
        
        localStorage.setItem('preferredTheme', selectedTheme);
    });
    
    const savedTheme = localStorage.getItem('preferredTheme');
    if (savedTheme) {
        themeSelect.value = savedTheme;
        if (savedTheme !== 'blue') {
            document.body.classList.add(`theme-${savedTheme}`);
        }
    }

    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            button.classList.add('active');
            
            const tabId = button.getAttribute('data-tab');
            const targetPane = tabId === 'generator' ? 
                document.getElementById('generator') : 
                document.getElementById('checker');
            
            targetPane.classList.add('active');
        });
    });

    const passwordOutput = document.getElementById('password-output');
    const copyButton = document.getElementById('copy-button');
    const generateButton = document.getElementById('generate-button');
    const lengthSlider = document.getElementById('password-length');
    const lengthValue = document.getElementById('length-value');
    const uppercaseCheckbox = document.getElementById('uppercase');
    const lowercaseCheckbox = document.getElementById('lowercase');
    const numbersCheckbox = document.getElementById('numbers');
    const symbolsCheckbox = document.getElementById('symbols');
    
    lengthSlider.addEventListener('input', () => {
        lengthValue.textContent = lengthSlider.value;
    });
    
    generateButton.addEventListener('click', generatePassword);
    
    generatePassword();
    
    function generatePassword() {
        const length = parseInt(lengthSlider.value);
        const includeUppercase = uppercaseCheckbox.checked;
        const includeLowercase = lowercaseCheckbox.checked;
        const includeNumbers = numbersCheckbox.checked;
        const includeSymbols = symbolsCheckbox.checked;
        
        if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
            passwordOutput.value = 'Invalid!';
            return;
        }
        
        const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
        const numberChars = '0123456789';
        const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        let validChars = '';
        const mustInclude = [];
        
        if (includeUppercase) {
            validChars += uppercaseChars;
            mustInclude.push(getRandomChar(uppercaseChars));
        }
        
        if (includeLowercase) {
            validChars += lowercaseChars;
            mustInclude.push(getRandomChar(lowercaseChars));
        }
        
        if (includeNumbers) {
            validChars += numberChars;
            mustInclude.push(getRandomChar(numberChars));
        }
        
        if (includeSymbols) {
            validChars += symbolChars;
            mustInclude.push(getRandomChar(symbolChars));
        }
        
        let password = '';
        
        password += mustInclude.join('');
        
        for (let i = password.length; i < length; i++) {
            password += validChars.charAt(Math.floor(Math.random() * validChars.length));
        }
        
        password = shuffleString(password);
        
        passwordOutput.value = password;
    }
    
    function getRandomChar(charSet) {
        return charSet.charAt(Math.floor(Math.random() * charSet.length));
    }
    
    function shuffleString(string) {
        const array = string.split('');
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array.join('');
    }
    
    copyButton.addEventListener('click', () => {
        passwordOutput.select();
        document.execCommand('copy');
        
        const originalText = copyButton.textContent;
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
            copyButton.textContent = originalText;
        }, 1500);
    });

    const passwordCheck = document.getElementById('password-check');
    const checkButton = document.getElementById('check-button');
    const toggleVisibilityBtn = document.getElementById('toggle-visibility');
    const breachStatus = document.getElementById('breach-status');
    const timesExposed = document.getElementById('times-exposed');
    const results = document.getElementById('results');
    const loading = document.getElementById('loading');
    const validationMessage = document.getElementById('validation-message');
    
    toggleVisibilityBtn.addEventListener('click', () => {
        if (passwordCheck.type === 'password') {
            passwordCheck.type = 'text';
            toggleVisibilityBtn.querySelector('.visibility-icon').textContent = '👁️‍🗨️';
        } else {
            passwordCheck.type = 'password';
            toggleVisibilityBtn.querySelector('.visibility-icon').textContent = '👁️';
        }
    });
    
    checkButton.addEventListener('click', checkPassword);
    
    passwordCheck.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            checkPassword();
        }
    });
    
    async function checkPassword() {
        const password = passwordCheck.value;
        
        results.classList.add('hidden');
        validationMessage.classList.add('hidden');
        
        if (!password) {
            validationMessage.textContent = 'Please enter a password to check';
            validationMessage.classList.remove('hidden');
            return;
        }
        
        loading.classList.remove('hidden');
        
        try {
            const hashHex = await sha1(password);
            
            const prefix = hashHex.substring(0, 5);
            const suffix = hashHex.substring(5).toUpperCase();
            
            const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
            const data = await response.text();
            
            const hashSuffixes = data.split('\r\n');
            let found = false;
            let occurrences = 0;
            
            for (const line of hashSuffixes) {
                const [hashSuffix, count] = line.split(':');
                
                if (hashSuffix === suffix) {
                    found = true;
                    occurrences = parseInt(count);
                    break;
                }
            }
            
            if (found) {
                breachStatus.textContent = 'Compromised';
                breachStatus.className = 'compromised';
                timesExposed.textContent = occurrences.toLocaleString();
            } else {
                breachStatus.textContent = 'Secure';
                breachStatus.className = 'secure';
                timesExposed.textContent = '0';
            }
            
            loading.classList.add('hidden');
            results.classList.remove('hidden');
            
        } catch (error) {
            console.error('Error checking password:', error);
            loading.classList.add('hidden');
            validationMessage.textContent = 'An error occurred while checking the password. Please try again.';
            validationMessage.classList.remove('hidden');
        }
    }
    
    async function sha1(message) {
        const msgBuffer = new TextEncoder().encode(message);
        
        const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
        
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        return hashHex;
    }
});