'use strict';

const validation = {
  error(err, fullError) {
    if (!err) return false;
    fullError = fullError ? `\n Full Error: "${fullError}"` : '';
    console.error(`Form Error: ${err} ${fullError}`)
  },


  checkForErrors(inputs) {
    for (let i = 0; i < inputs.length; i++) {
      const { input: inputStr, error: errorStr } = inputs[i]
      // console.log(inputEl, errorEl, msg, type, emailMsg, min, max)
      if (!inputStr || !errorStr) {
        this.error('Neither input element nor error element can be empty.');
        return false
      }

      const inputEl = document.querySelector(inputStr), errorEl = document.querySelector(errorStr);
      if (!inputEl || !errorEl) {
        this.error(`Invalid selector/s (${inputStr} for input and ${errorStr} for error element)`); return false;
      }
      return true;
    } // End for
  },

  checkEmpty(input) {
    if (!input.value) return false;
    return true;
  },

  validateEmail(input) {
    if (!input) return false;
    const REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!input.value.match(REGEX)) return false;
    return true;
  },

  minmax({ min, max }, { length }) {
    if (max === Infinity) return true;
    else if (length > min && max >= length) return true;
    return false
  },

  validate(e, { dataset: { validate: data_validate } }) {
    try {
      var inputs = JSON.parse(data_validate)
    } catch (err) {
      this.error('Invalid JSON', err);
      e.preventDefault();
      return false;
    }

    if (!this.checkForErrors(inputs)) {
      e.preventDefault();
      return false
    };

    inputs.forEach(({ input: inputEl, error: errorEl, errorMessage: msg = 'Please fill out this field', type = 'text', emailMessage: emailMsg = 'Please write a valid email address', min = 1, max = Infinity, minMaxMessage: minMaxMessage = `Must be between ${min} and ${max}` }) => {
      inputEl = document.querySelector(inputEl), errorEl = document.querySelector(errorEl)
      errorEl.innerHTML = '';

      if (!this.checkEmpty(inputEl)) {
        errorEl.innerHTML = msg;
        e.preventDefault();
        return false;
      } else if (type === 'email' && !this.validateEmail(inputEl)) {
        errorEl.innerHTML = emailMsg;
        e.preventDefault();
        return false;
      } else if (!this.minmax({ min: min, max: max }, inputEl.value.trim())) {
        errorEl.innerHTML = minMaxMessage;
        e.preventDefault();
        return false;
      }
    })

  }
}


document.querySelectorAll('[data-validate]').forEach(form => {
  form.addEventListener('submit', function (e) {
    validation.validate(e, this)
  })
})