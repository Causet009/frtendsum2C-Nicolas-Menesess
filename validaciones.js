document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('requestForm');
  const requestTypeRadios = Array.from(document.querySelectorAll('input[name="requestType"]'));
  const durationField = document.getElementById('durationField');
  const eventNameField = document.getElementById('eventNameField');
  const eventTypeField = document.getElementById('eventTypeField');
  const eventTypeOtherField = document.getElementById('eventTypeOtherField');
  const eventLocationField = document.getElementById('eventLocationField');
  const eventTypeSelect = document.getElementById('eventTypeSelect');
  const dietOtherCheckbox = document.getElementById('dietOtherCheckbox');
  const dietOtherField = document.getElementById('dietOtherField');
  const dietOtherCounter = document.getElementById('dietOtherCounter');
  const kidsMenuCheckbox = document.getElementById('kidsMenuCheckbox');
  const kidsMenuCountField = document.getElementById('kidsMenuCountField');
  const waiterField = document.getElementById('waiterField');
  const furnitureField = document.getElementById('furnitureField');
  const observationsCounter = document.getElementById('observationsCounter');
  const observationsTextarea = form.querySelector('textarea[name="observations"]');

  const fieldInputs = Array.from(form.querySelectorAll('input, select, textarea'));
  const drinkCheckboxes = Array.from(document.querySelectorAll('.drink-checkbox'));
  const requestFieldset = form.querySelector('fieldset');
  let validationMessages = [];

  function addValidationError(message) {
    if (!validationMessages.includes(message)) {
      validationMessages.push(message);
    }
  }

  function isCatering() {
    return form.querySelector('input[name="requestType"]:checked')?.value === 'catering';
  }

  function parseDate(value) {
    return value ? new Date(`${value}T00:00:00`) : null;
  }

  function parseTime(value) {
    if (!value) return null;
    const [hours, minutes] = value.split(':').map(Number);
    return { hours, minutes };
  }

  function addValidationClass(element, valid) {
    element.classList.remove('campo-error', 'campo-ok');
    if (valid === true) element.classList.add('campo-ok');
    if (valid === false) element.classList.add('campo-error');
  }

  function clearValidation() {
    fieldInputs.forEach((input) => {
      input.classList.remove('campo-error', 'campo-ok');
    });
    form.querySelectorAll('fieldset').forEach((fieldset) => fieldset.classList.remove('invalid'));
    validationMessages = [];
  }

  function updateRequestType() {
    const catering = isCatering();
    durationField.classList.toggle('hidden', !catering);
    eventNameField.classList.toggle('hidden', !catering);
    eventTypeField.classList.toggle('hidden', !catering);
    eventLocationField.classList.toggle('hidden', !catering);
    waiterField.classList.toggle('hidden', !catering);
    furnitureField.classList.toggle('hidden', !catering);

    const toggledInputs = [
      durationField.querySelector('select'),
      eventNameField.querySelector('input'),
      eventTypeField.querySelector('select'),
      eventLocationField.querySelector('input'),
      waiterField.querySelector('input'),
      furnitureField.querySelector('input')
    ];

    toggledInputs.forEach((input) => {
      if (!input) return;
      input.required = catering && ['eventName', 'eventLocation', 'duration', 'eventType'].includes(input.name);
    });
  }

  function updateEventTypeOther() {
    const isOther = eventTypeSelect.value === 'otro';
    eventTypeOtherField.classList.toggle('hidden', !isOther);
    const otherInput = eventTypeOtherField.querySelector('input');
    if (otherInput) otherInput.required = isOther;
  }

  function updateDietOther() {
    dietOtherField.classList.toggle('hidden', !dietOtherCheckbox.checked);
    const textarea = dietOtherField.querySelector('textarea');
    if (textarea) textarea.required = dietOtherCheckbox.checked;
  }

  function updateKidsMenuCount() {
    kidsMenuCountField.classList.toggle('hidden', !kidsMenuCheckbox.checked);
    const input = kidsMenuCountField.querySelector('input');
    if (input) input.required = kidsMenuCheckbox.checked;
  }

  function updateCounter(textarea, counter) {
    if (!textarea || !counter) return;
    counter.textContent = `${textarea.value.length} / ${textarea.maxLength}`;
  }

  function validateRequestType() {
    const selected = form.querySelector('input[name="requestType"]:checked');
    if (!selected) {
      requestFieldset.classList.add('invalid');
      return false;
    }
    requestFieldset.classList.remove('invalid');
    return true;
  }

  function validateDateTime() {
    const dateInput = form.elements.eventDate;
    const timeInput = form.elements.eventTime;
    let valid = true;

    const today = new Date();
    const selectedDate = parseDate(dateInput.value);

    if (!dateInput.value || !selectedDate) {
      addValidationClass(dateInput, false);
      addValidationError('Faltan campos obligatorios por completar.');
      valid = false;
    } else {
      const startDate = new Date(selectedDate.getTime());
      startDate.setHours(0, 0, 0, 0);
      const minDate = new Date(today.getTime());
      if (isCatering()) {
        minDate.setDate(minDate.getDate() + 7);
      } else {
        minDate.setDate(minDate.getDate() + 2);
      }
      minDate.setHours(0, 0, 0, 0);

      if (selectedDate < minDate) {
        addValidationClass(dateInput, false);
        addValidationError('La fecha debe respetar el plazo mínimo según el tipo de solicitud.');
        valid = false;
      } else {
        addValidationClass(dateInput, true);
      }
    }

    const timeValue = timeInput.value;
    const parsedTime = parseTime(timeValue);
    if (!timeValue || !parsedTime) {
      addValidationClass(timeInput, false);
      addValidationError('Faltan campos obligatorios por completar.');
      valid = false;
    } else if (!isCatering()) {
      const { hours, minutes } = parsedTime;
      const totalMinutes = hours * 60 + minutes;
      const minMinutes = 12 * 60;
      const maxMinutes = 23 * 60;
      if (totalMinutes < minMinutes || totalMinutes > maxMinutes) {
        addValidationClass(timeInput, false);
        valid = false;
      } else {
        addValidationClass(timeInput, true);
      }
    } else {
      addValidationClass(timeInput, true);
    }

    return valid;
  }

  function validateCateringFields() {
    if (!isCatering()) return true;
    let valid = true;

    const eventName = form.elements.eventName;
    if (!eventName.value.trim() || eventName.value.trim().length < 5) {
      addValidationClass(eventName, false);
      valid = false;
    } else {
      addValidationClass(eventName, true);
    }

    const eventType = form.elements.eventType;
    if (!eventType.value) {
      addValidationClass(eventType, false);
      valid = false;
    } else {
      addValidationClass(eventType, true);
    }

    const eventTypeOther = form.elements.eventTypeOther;
    if (eventType.value === 'otro') {
      if (!eventTypeOther.value.trim()) {
        addValidationClass(eventTypeOther, false);
        valid = false;
      } else {
        addValidationClass(eventTypeOther, true);
      }
    } else {
      addValidationClass(eventTypeOther, true);
    }

    const eventLocation = form.elements.eventLocation;
    if (!eventLocation.value.trim() || eventLocation.value.trim().length < 10) {
      addValidationClass(eventLocation, false);
      valid = false;
    } else {
      addValidationClass(eventLocation, true);
    }

    const duration = form.elements.duration;
    if (!duration.value) {
      addValidationClass(duration, false);
      valid = false;
    } else {
      addValidationClass(duration, true);
    }

    return valid;
  }

  function validateRequiredFields() {
    let valid = true;
    const requiredSelectors = [
      'input[name="fullName"]',
      'input[name="email"]',
      'input[name="emailConfirm"]',
      'input[name="phone"]'
    ];

    requiredSelectors.forEach((selector) => {
      const element = form.querySelector(selector);
      if (element && !element.value.trim()) {
        addValidationClass(element, false);
        addValidationError('Faltan campos obligatorios por completar.');
        valid = false;
      } else if (element) {
        addValidationClass(element, true);
      }
    });

    const emailValue = form.elements.email.value.trim();
    const emailConfirmValue = form.elements.emailConfirm.value.trim();
    if (emailValue && emailConfirmValue && emailValue !== emailConfirmValue) {
      addValidationClass(form.elements.emailConfirm, false);
      addValidationError('Los correos electrónicos no coinciden.');
      valid = false;
    }

    return valid;
  }

  function validateSectionB() {
    let valid = true;

    const adultsInput = form.elements.adults;
    const childrenInput = form.elements.children;
    const dietOtherDetails = form.elements.dietOtherDetails;
    const kidsMenuCountInput = form.elements.kidsMenuCount;

    const adultsValue = Number(adultsInput.value);
    const childrenValue = Number(childrenInput.value);
    const isCateringRequest = isCatering();
    const maxAdults = isCateringRequest ? 200 : 20;

    if (!Number.isInteger(adultsValue) || adultsValue < 1 || adultsValue > maxAdults) {
      addValidationClass(adultsInput, false);
      addValidationError(`Cantidad de adultos inválida. Debe ser al menos 1 y como máximo ${maxAdults}.`);
      valid = false;
    } else {
      addValidationClass(adultsInput, true);
    }

    if (!Number.isInteger(childrenValue) || childrenValue < 0 || childrenValue > 50 || childrenValue > adultsValue) {
      addValidationClass(childrenInput, false);
      addValidationError('Cantidad de menores inválida. Debe ser un número entre 0 y 50 y no puede superar la cantidad de adultos.');
      valid = false;
    } else {
      addValidationClass(childrenInput, true);
    }

    if (dietOtherCheckbox.checked) {
      if (!dietOtherDetails || !dietOtherDetails.value.trim() || dietOtherDetails.value.trim().length > 200) {
        addValidationClass(dietOtherDetails, false);
        addValidationError('Detalle otras restricciones requerido y no puede superar 200 caracteres.');
        valid = false;
      } else {
        addValidationClass(dietOtherDetails, true);
      }
    } else if (dietOtherDetails) {
      addValidationClass(dietOtherDetails, true);
    }

    if (kidsMenuCheckbox.checked) {
      const kidsMenuCountValue = Number(kidsMenuCountInput.value);
      if (
        !Number.isInteger(kidsMenuCountValue) ||
        kidsMenuCountValue < 1 ||
        kidsMenuCountValue > childrenValue ||
        childrenValue < 1
      ) {
        addValidationClass(kidsMenuCountInput, false);
        valid = false;
      } else {
        addValidationClass(kidsMenuCountInput, true);
      }
    } else if (kidsMenuCountInput) {
      addValidationClass(kidsMenuCountInput, true);
    }

    return valid;
  }

  function validateAccepted() {
    const acceptContact = form.elements.acceptContact;
    const acceptTerms = form.elements.acceptTerms;
    const acceptPrivacy = form.elements.acceptPrivacy;
    let valid = true;

    [acceptContact, acceptTerms, acceptPrivacy].forEach((checkbox) => {
      if (!checkbox.checked) {
        addValidationClass(checkbox, false);
        valid = false;
      } else {
        addValidationClass(checkbox, true);
      }
    });

    return valid;
  }

  function validateKidsMenuCount() {
    if (!kidsMenuCheckbox.checked) return true;
    const input = form.elements.kidsMenuCount;
    if (!input.value || Number(input.value) < 1) {
      addValidationClass(input, false);
      return false;
    }
    addValidationClass(input, true);
    return true;
  }

  function validateForm() {
    clearValidation();

    const checks = [
      validateRequestType(),
      validateDateTime(),
      validateCateringFields(),
      validateSectionB(),
      validateRequiredFields(),
      validateDrinks(),
      validateAccepted(),
      validateKidsMenuCount()
    ];

    return checks.every(Boolean);
  }

  requestTypeRadios.forEach((radio) => radio.addEventListener('change', () => {
    updateRequestType();
    validateForm();
  }));

  eventTypeSelect.addEventListener('change', () => {
    updateEventTypeOther();
    validateForm();
  });

  dietOtherCheckbox.addEventListener('change', updateDietOther);
  kidsMenuCheckbox.addEventListener('change', () => {
    updateKidsMenuCount();
    validateForm();
  });

  observationsTextarea.addEventListener('input', function () {
    updateCounter(observationsTextarea, observationsCounter);
  });

  const dietOtherTextarea = form.querySelector('textarea[name="dietOtherDetails"]');
  if (dietOtherTextarea) {
    dietOtherTextarea.addEventListener('input', function () {
      updateCounter(dietOtherTextarea, dietOtherCounter);
    });
  }

  drinkCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', validateDrinks);
  });

  form.addEventListener('submit', function (event) {
    if (!validateForm()) {
      event.preventDefault();
      const firstError = form.querySelector('.campo-error, fieldset.invalid');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      const message = validationMessages.length > 0
        ? validationMessages.join('\n')
        : 'Hay campos con información inválida. Revisa las secciones destacadas.';
      alert(message);
    } else {
      event.preventDefault();
      alert('Solicitud enviada correctamente. ¡Gracias!');
      form.reset();
      updateRequestType();
      updateEventTypeOther();
      updateDietOther();
      updateKidsMenuCount();
      updateCounter(observationsTextarea, observationsCounter);
      const dietOtherTextarea = form.querySelector('textarea[name="dietOtherDetails"]');
      if (dietOtherTextarea) updateCounter(dietOtherTextarea, dietOtherCounter);
    }
  });

  updateRequestType();
  updateEventTypeOther();
  updateDietOther();
  updateKidsMenuCount();
  updateCounter(observationsTextarea, observationsCounter);
  if (dietOtherTextarea) updateCounter(dietOtherTextarea, dietOtherCounter);
});
