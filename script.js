// Element references
const passwordResult = document.getElementById('password-result');
const passwordLength = document.getElementById('password-length');
const lengthValue = document.getElementById('length-value');
const includeUppercase = document.getElementById('include-uppercase');
const includeLowercase = document.getElementById('include-lowercase');
const includeNumbers = document.getElementById('include-numbers');
const includeSymbols = document.getElementById('include-symbols');
const generateButton = document.getElementById('generate-password');
const copyButton = document.querySelector('.copy-button');
const strengthMeter = document.querySelector('.strength-meter-fill');
const strengthText = document.getElementById('strength-text');
const scrollToGenerator = document.getElementById('scroll-to-generator');
const checkPwnedButton = document.getElementById('check-pwned');
const faqItems = document.querySelectorAll('.faq-item');

// Password generation
generateButton.addEventListener('click', generatePassword);

// Update length value display
passwordLength.addEventListener('input', () => {
  lengthValue.textContent = passwordLength.value;
});

scrollToGenerator.addEventListener('click', () => {
  const generatorSection = document.getElementById('generator');
  const offset = 50; // Adjust value if need be
  const elementPosition = generatorSection.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  });
});

// Copy password to clipboard
copyButton.addEventListener('click', async () => {
  if (!passwordResult.value) {
    showToast('No password to copy!', 'info');
    return;
  }

  try {
    await navigator.clipboard.writeText(passwordResult.value);
    showToast('Password copied to clipboard!', 'success');
  } catch (err) {
    showToast('Failed to copy password.', 'error');
  }
});

// Check if password has been pwned
checkPwnedButton.addEventListener('click', async () => {
  if (!passwordResult.value) {
    showToast('Generate a password first!', 'info');
    return;
  }

  try {
    const password = passwordResult.value;
    const hash = await sha1(password);
    const prefix = hash.substring(0, 5).toUpperCase();
    const suffix = hash.substring(5).toUpperCase();

    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`
    );
    if (!response.ok) {
      throw new Error('Failed to check password');
    }

    const data = await response.text();
    const breachData = data.split('\n').map((line) => line.split(':'));
    const found = breachData.find(([hashSuffix]) => hashSuffix === suffix);

    if (found) {
      const [, count] = found;
      showToast(
        `This password has been found in ${count} data breaches! Please generate a new one.`,
        'error'
      );
    } else {
      showToast(
        "Good news! This password hasn't been found in any known data breaches.",
        'success'
      );
    }
  } catch (err) {
    showToast('Failed to check password against breach database.', 'error');
  }
});

// Password generation function
function generatePassword() {
  const length = parseInt(passwordLength.value);
  const hasUppercase = includeUppercase.checked;
  const hasLowercase = includeLowercase.checked;
  const hasNumbers = includeNumbers.checked;
  const hasSymbols = includeSymbols.checked;

  // Validate at least one character set is selected
  if (!hasUppercase && !hasLowercase && !hasNumbers && !hasSymbols) {
    showToast('Please select at least one character type!', 'error');
    return;
  }

  // Character sets
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_-+=<>?/.,:;{}[]|~';

  let chars = '';
  if (hasUppercase) chars += uppercase;
  if (hasLowercase) chars += lowercase;
  if (hasNumbers) chars += numbers;
  if (hasSymbols) chars += symbols;

  // Generate password
  let password = '';
  let meetsRequirements = false;

  while (!meetsRequirements) {
    password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      password += chars[randomIndex];
    }

    // Check if password meets requirements
    meetsRequirements =
      (!hasUppercase || /[A-Z]/.test(password)) &&
      (!hasLowercase || /[a-z]/.test(password)) &&
      (!hasNumbers || /[0-9]/.test(password)) &&
      (!hasSymbols || /[!@#$%^&*()_\-+=<>?/.,:;{}[\]|~]/.test(password));
  }

  // Update password display
  passwordResult.value = password;

  // Update strength meter
  updateStrengthMeter(password);

  // Magical animation
  passwordResult.classList.add('magical-appear');
  setTimeout(() => {
    passwordResult.classList.remove('magical-appear');
  }, 500);

  showToast('Password successfully generated!', 'success');
}

// Update password strength meter
function updateStrengthMeter(password) {
  let strength = 0;

  // Length contribution (up to 40%)
  const lengthScore = Math.min(password.length / 32, 1) * 40;
  strength += lengthScore;

  // Character diversity (up to 60%)
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[a-z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[^A-Za-z0-9]/.test(password)) strength += 15;

  // Update the meter
  strengthMeter.style.width = `${strength}%`;

  // Color based on strength
  if (strength < 25) {
    strengthMeter.style.backgroundColor = '#ff4d4d'; // Red
    strengthText.textContent = 'Weak Spell';
  } else if (strength < 50) {
    strengthMeter.style.backgroundColor = '#ffad4d'; // Orange
    strengthText.textContent = 'Moderate Spell';
  } else if (strength < 75) {
    strengthMeter.style.backgroundColor = '#ffff4d'; // Yellow
    strengthText.textContent = 'Strong Spell';
  } else {
    strengthMeter.style.backgroundColor = '#4dff4d'; // Green
    strengthText.textContent = 'Powerful Enchantment';
  }
}

// Toast notification function
function showToast(message, type = 'info') {
  const toastContainer = document.querySelector('.toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  // Remove toast after animation
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// SHA-1 hashing function for HIBP API
async function sha1(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// FAQ accordion functionality
faqItems.forEach((item) => {
  const question = item.querySelector('.faq-question');
  question.addEventListener('click', () => {
    // Check if this item is already active
    const isActive = item.classList.contains('active');

    // Close all FAQ items
    faqItems.forEach((faq) => {
      faq.classList.remove('active');
    });

    // If the clicked item wasn't active before, open it
    if (!isActive) {
      item.classList.add('active');
    }
  });

  // Keyboard accessibility
  question.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      question.click();
    }
  });
});

// Keyboard navigation enhancement
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-user');
  }
});

document.addEventListener('mousedown', () => {
  document.body.classList.remove('keyboard-user');
});
