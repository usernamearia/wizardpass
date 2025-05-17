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
if (generateButton) {
  generateButton.addEventListener('click', generatePassword);
}

// Update length value display
if (passwordLength) {
  passwordLength.addEventListener('input', () => {
    if (lengthValue) {
      lengthValue.textContent = passwordLength.value;
    }
    // Optionally, regenerate password or update strength on length change
    // generatePassword(); // if you want it to auto-update as slider moves
  });
}

if (scrollToGenerator) {
  scrollToGenerator.addEventListener('click', () => {
    const generatorSection = document.getElementById('generator');
    if (generatorSection) {
      const offset = 70; // Adjusted offset for potentially taller fixed header
      const elementPosition = generatorSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  });
}

// Copy password to clipboard
if (copyButton) {
  copyButton.addEventListener('click', async () => {
    if (!passwordResult.value) {
      showToast('No password to copy!', 'info');
      return;
    }

    try {
      await navigator.clipboard.writeText(passwordResult.value);
      showToast('Password copied to clipboard!', 'success');
    } catch (err) {
      console.error('Failed to copy: ', err);
      showToast('Failed to copy password.', 'error');
    }
  });
}

// Check if password has been pwned
if (checkPwnedButton) {
  checkPwnedButton.addEventListener('click', async () => {
    if (!passwordResult.value) {
      showToast('Generate a password first!', 'info');
      return;
    }

    showToast('Checking password breach status...', 'info'); // Notify user

    try {
      const password = passwordResult.value;
      const hash = await sha1(password);
      const prefix = hash.substring(0, 5).toUpperCase();
      const suffix = hash.substring(5).toUpperCase();

      const response = await fetch(
        `https://api.pwnedpasswords.com/range/${prefix}`
      );
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.text();
      const breachData = data.split('\r\n').map((line) => line.split(':')); // Ensure using \r\n for splitting as per API
      const found = breachData.find(([hashSuffix]) => hashSuffix === suffix);

      if (found) {
        const [, count] = found;
        showToast(
          `Warning! This password has appeared in ${count} data breaches. Consider a different one.`,
          'error'
        );
      } else {
        showToast(
          "Good news! This password wasn't found in known data breaches.",
          'success'
        );
      }
    } catch (err) {
      console.error('Pwned check error: ', err);
      showToast(
        'Could not check password against breach database. Please try again later.',
        'error'
      );
    }
  });
}

// Password generation function
function generatePassword() {
  const length = parseInt(passwordLength.value);
  const hasUppercase = includeUppercase.checked;
  const hasLowercase = includeLowercase.checked;
  const hasNumbers = includeNumbers.checked;
  const hasSymbols = includeSymbols.checked;

  if (!hasUppercase && !hasLowercase && !hasNumbers && !hasSymbols) {
    showToast('Please select at least one character type!', 'error');
    if (passwordResult) passwordResult.value = ''; // Clear password field
    updateStrengthMeter(''); // Reset strength meter
    return;
  }

  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_-+=<>?/.,:;{}[]|~';

  let charPool = '';
  let guaranteedChars = '';

  if (hasUppercase) {
    charPool += uppercaseChars;
    guaranteedChars +=
      uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
  }
  if (hasLowercase) {
    charPool += lowercaseChars;
    guaranteedChars +=
      lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
  }
  if (hasNumbers) {
    charPool += numberChars;
    guaranteedChars +=
      numberChars[Math.floor(Math.random() * numberChars.length)];
  }
  if (hasSymbols) {
    charPool += symbolChars;
    guaranteedChars +=
      symbolChars[Math.floor(Math.random() * symbolChars.length)];
  }

  let password = guaranteedChars;
  const remainingLength = length - guaranteedChars.length;

  if (remainingLength < 0 && passwordResult) {
    // Should not happen if length >= number of selected types
    passwordResult.value = 'Too short for selected types.';
    return;
  }

  for (let i = 0; i < remainingLength; i++) {
    const randomIndex = Math.floor(Math.random() * charPool.length);
    password += charPool[randomIndex];
  }

  // Shuffle the password to ensure guaranteed characters are not always at the beginning
  password = password
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');

  if (passwordResult) {
    passwordResult.value = password;
  }

  updateStrengthMeter(password);

  if (passwordResult) {
    passwordResult.classList.add('magical-appear');
    setTimeout(() => {
      passwordResult.classList.remove('magical-appear');
    }, 500);
  }
  // Don't show toast on every generation, only on explicit actions or errors.
  // showToast('Password spell cast successfully!', 'success');
}

// Update password strength meter
function updateStrengthMeter(password) {
  if (!strengthMeter || !strengthText) return;

  let strengthScore = 0;
  if (!password) {
    // Reset if password is empty
    strengthMeter.style.width = '0%';
    strengthMeter.style.backgroundColor = '#5c5c5c'; // Default weak color
    strengthText.textContent = 'Awaiting Enchantment';
    return;
  }

  // Length contribution (max 30 points)
  if (password.length >= 8) strengthScore += 10;
  if (password.length >= 12) strengthScore += 10;
  if (password.length >= 16) strengthScore += 10;

  // Character type contributions (max 40 points - 10 each)
  if (/[A-Z]/.test(password)) strengthScore += 10;
  if (/[a-z]/.test(password)) strengthScore += 10;
  if (/[0-9]/.test(password)) strengthScore += 10;
  if (/[^A-Za-z0-9]/.test(password)) strengthScore += 10; // Symbols

  // Bonus for mixed case and alpha-numeric with symbols (max 30 points)
  const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasAlphaNum = /[a-zA-Z]/.test(password) && /[0-9]/.test(password);

  if (hasMixedCase) strengthScore += 10;
  if (hasAlphaNum) strengthScore += 10;
  if (
    hasMixedCase &&
    hasAlphaNum &&
    /[^A-Za-z0-9]/.test(password) &&
    password.length >= 12
  )
    strengthScore += 10; // All types and good length

  const percentage = Math.min(Math.max(strengthScore, 0), 100); // Cap at 100
  strengthMeter.style.width = `${percentage}%`;

  // Ravenclaw Theme Colors for Strength Meter
  if (percentage < 30) {
    strengthMeter.style.backgroundColor = '#5c5c5c'; // Dark Grey - Unpolished Metal
    strengthText.textContent = 'Fledgling Spell';
  } else if (percentage < 50) {
    strengthMeter.style.backgroundColor = '#785a28'; // Duller Bronze
    strengthText.textContent = 'Apprentice Charm';
  } else if (percentage < 75) {
    strengthMeter.style.backgroundColor = '#946b2d'; // Standard Bronze (Accent Color)
    strengthText.textContent = 'Adept Incantation';
  } else {
    strengthMeter.style.backgroundColor = '#4d8eff'; // Bright, Magical Blue
    strengthText.textContent = 'Masterful Enchantment';
  }
}

// Toast notification function
function showToast(message, type = 'info') {
  const toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`; // e.g. toast success, toast error
  toast.textContent = message;
  toast.setAttribute('role', 'alert'); // Accessibility

  // Optional: Add a close button to toasts
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.color = 'inherit';
  closeButton.style.marginLeft = '15px';
  closeButton.style.fontSize = '1.2em';
  closeButton.style.cursor = 'pointer';
  closeButton.setAttribute('aria-label', 'Close notification');
  closeButton.onclick = () => {
    toast.classList.add('fade-out-manual'); // Add class for manual fade out
    setTimeout(() => toast.remove(), 300); // Remove after animation
  };
  toast.appendChild(closeButton);

  toastContainer.appendChild(toast);

  // Auto remove toast
  const autoRemoveTimeout = setTimeout(() => {
    // Check if toast still exists (wasn't manually closed)
    if (toast.parentElement) {
      toast.classList.add('fade-out-auto'); // Add class for auto fade out
      setTimeout(() => toast.remove(), 300); // Remove after animation
    }
  }, 4000); // Increased duration for toasts to be readable

  // Clear auto-remove if manually closed
  closeButton.addEventListener('click', () => {
    clearTimeout(autoRemoveTimeout);
  });
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
if (faqItems) {
  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Optional: Close other FAQ items when one is opened
        // faqItems.forEach(otherItem => {
        //   if (otherItem !== item) otherItem.classList.remove('active');
        // });
        item.classList.toggle('active');
      });

      question.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          question.click();
        }
      });
    }
  });
}

// Keyboard navigation enhancement: Add a class to the body when Tab is pressed
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-user');
  }
});
// Remove the class if the user uses the mouse
document.addEventListener('mousedown', () => {
  document.body.classList.remove('keyboard-user');
});

// Initial password generation on page load
document.addEventListener('DOMContentLoaded', () => {
  if (passwordLength && lengthValue) {
    // Ensure elements exist
    lengthValue.textContent = passwordLength.value;
  }
  generatePassword();
});
