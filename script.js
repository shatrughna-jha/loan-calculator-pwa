
function calculateEMI() {
  const loanAmount = parseFloat(document.getElementById('loanAmount').value) || 0;
  const interestRate = parseFloat(document.getElementById('interestRate').value) || 0;
  const tenure = parseInt(document.getElementById('tenure').value) || 0;
  const tenureType = document.getElementById('tenureType').value;

  const months = tenureType === 'years' ? tenure * 12 : tenure;
  const monthlyRate = interestRate / 12 / 100;

  if (!loanAmount || !monthlyRate || !months) {
    document.getElementById('emi').textContent = '-';
    document.getElementById('totalInterest').textContent = '-';
    document.getElementById('totalPayment').textContent = '-';
    return;
  }

  const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
              (Math.pow(1 + monthlyRate, months) - 1);
  const totalPayment = emi * months;
  const totalInterest = totalPayment - loanAmount;

  document.getElementById('emi').textContent = emi.toFixed(2);
  document.getElementById('totalInterest').textContent = totalInterest.toFixed(2);
  document.getElementById('totalPayment').textContent = totalPayment.toFixed(2);
}

document.querySelectorAll('#loan-form input, #loan-form select').forEach(input => {
  input.addEventListener('input', calculateEMI);
});

calculateEMI();
