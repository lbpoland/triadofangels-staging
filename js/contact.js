// Contact form: opens the visitor's email client with a pre-filled message.
// Static-site friendly (no server). No inline handlers. No HTML injection.

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const statusEl = document.getElementById('contact-status');

  const nameEl = form.querySelector('#name');
  const emailEl = form.querySelector('#email');
  const messageEl = form.querySelector('#message');

  function setStatus(msg) {
    if (!statusEl) return;
    statusEl.textContent = msg;
  }

  function safeTrim(v) {
    return (v || '').toString().trim();
  }

  function isEmailLike(v) {
    const s = safeTrim(v);
    // Lightweight check. The browser's built-in validation still runs.
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = safeTrim(nameEl && nameEl.value);
    const email = safeTrim(emailEl && emailEl.value);
    const message = safeTrim(messageEl && messageEl.value);

    if (!name || !email || !message) {
      setStatus('Please fill out Name, Email, and Message.');
      return;
    }

    if (!isEmailLike(email)) {
      setStatus('Please enter a valid email address.');
      return;
    }

    const subject = `Triad of Angels — Contact (from ${name})`;
    const body = [
      'Name: ' + name,
      'Email: ' + email,
      '',
      message,
      '',
      '—',
      'Sent via triadofangels.com contact form'
    ].join('\n');

    const mailto = 'mailto:contact@triadofangels.com'
      + '?subject=' + encodeURIComponent(subject)
      + '&body=' + encodeURIComponent(body);

    setStatus('Opening your email app… If it does not open, please email us directly.');
    window.location.href = mailto;
  });
});