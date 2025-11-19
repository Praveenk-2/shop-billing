// Input validation functions

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePhone(phone) {
  const re = /^[0-9]{10}$/;
  return re.test(phone);
}

export function validateBarcode(barcode) {
  return barcode && barcode.length >= 4 && barcode.length <= 50;
}

export function validatePrice(price) {
  return !isNaN(price) && parseFloat(price) >= 0;
}

export function validateQuantity(quantity) {
  return Number.isInteger(parseInt(quantity)) && parseInt(quantity) > 0;
}

export function validatePassword(password) {
  // At least 6 characters
  return password && password.length >= 6;
}