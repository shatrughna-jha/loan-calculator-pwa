
function parsePrepayments() {
  const rows = document.querySelectorAll('.prepayment-row');
  const prepayments = [];
  rows.forEach(row => {
    const amount = parseFloat(row.querySelector('.prepayment-amount').value) || 0;
    const date = row.querySelector('.prepayment-date').value;
    if (amount > 0 && date) {
      prepayments.push({ amount, date: new Date(date + '-01') });
    }
  });
  return prepayments;
}

function calculateEMIandSchedule() {
  const loanAmount = parseFloat(document.getElementById('loanAmount').value) || 0;
  const interestRate = parseFloat(document.getElementById('interestRate').value) || 0;
  const tenure = parseInt(document.getElementById('tenure').value) || 0;
  const tenureType = document.getElementById('tenureType').value;
  const startDate = new Date(document.getElementById('startDate').value + '-01');

  const months = tenureType === 'years' ? tenure * 12 : tenure;
  const monthlyRate = interestRate / 12 / 100;

  const prepayments = parsePrepayments();

  if (!loanAmount || !monthlyRate || !months) {
    document.getElementById('emi').textContent = '-';
    document.getElementById('totalInterest').textContent = '-';
    document.getElementById('totalPayment').textContent = '-';
    document.getElementById('amortizationBody').innerHTML = '';
    return;
  }

  const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
              (Math.pow(1 + monthlyRate, months) - 1);

  let balance = loanAmount;
  let totalInterest = 0;
  let currentDate = new Date(startDate);
  let schedule = [];
  let prepayIndex = 0;
  let count = 0;

  while (balance > 0.5 && count < 1000) {
    const interest = balance * monthlyRate;
    let principal = emi - interest;
    let prepay = 0;

    if (prepayIndex < prepayments.length &&
        currentDate.getFullYear() === prepayments[prepayIndex].date.getFullYear() &&
        currentDate.getMonth() === prepayments[prepayIndex].date.getMonth()) {
      prepay = prepayments[prepayIndex].amount;
      prepayIndex++;
    }

    if (principal + prepay > balance) {
      principal = balance - prepay;
    }

    balance -= (principal + prepay);
    totalInterest += interest;

    schedule.push({
      date: `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`,
      opening: balance + principal + prepay,
      emi: emi.toFixed(2),
      interest: interest.toFixed(2),
      principal: principal.toFixed(2),
      prepay: prepay.toFixed(2),
      closing: balance < 0 ? 0 : balance.toFixed(2)
    });

    currentDate.setMonth(currentDate.getMonth() + 1);
    count++;
  }

  document.getElementById('emi').textContent = emi.toFixed(2);
  document.getElementById('totalInterest').textContent = totalInterest.toFixed(2);
  document.getElementById('totalPayment').textContent = (totalInterest + loanAmount).toFixed(2);
  document.getElementById('tenureUsed').textContent = schedule.length;

  const tbody = document.getElementById('amortizationBody');
  tbody.innerHTML = '';
  schedule.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.date}</td>
      <td>${row.opening}</td>
      <td>${row.emi}</td>
      <td>${row.interest}</td>
      <td>${row.principal}</td>
      <td>${row.prepay}</td>
      <td>${row.closing}</td>
    `;
    tbody.appendChild(tr);
  });
}

function addPrepaymentRow() {
  const container = document.getElementById('prepaymentList');
  const div = document.createElement('div');
  div.className = 'prepayment-row';
  div.innerHTML = \`
    <input type="month" class="prepayment-date" />
    <input type="number" class="prepayment-amount" placeholder="Amount" />
  \`;
  container.appendChild(div);
  div.querySelectorAll('input').forEach(input => input.addEventListener('input', calculateEMIandSchedule));
}

document.querySelectorAll('#loan-form input, #loan-form select').forEach(input => {
  input.addEventListener('input', calculateEMIandSchedule);
});
document.getElementById('addPrepayment').addEventListener('click', addPrepaymentRow);
calculateEMIandSchedule();
