/* step.js — section stepper for QIROX Foundation modules */
(function() {
  var steps, dots, current = 0;

  window.initStepper = function() {
    steps = Array.from(document.querySelectorAll('.stepper > .step'));
    dots = Array.from(document.querySelectorAll('.step-dot'));
    if (!steps.length) return;
    goTo(0);
  };

  function goTo(n) {
    if (steps[current]) steps[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');
    current = Math.max(0, Math.min(n, steps.length - 1));
    if (steps[current]) steps[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');

    var prev = document.querySelector('.step-prev');
    var next = document.querySelector('.step-next');
    if (prev) prev.disabled = current === 0;
    if (next) next.disabled = current === steps.length - 1;

    var label = document.querySelector('.step-label');
    if (label && steps[current]) {
      var name = steps[current].dataset.label || ('Step ' + (current + 1));
      label.textContent = name + ' — ' + (current + 1) + ' of ' + steps.length;
    }

    window.scrollTo({ top: 56, behavior: 'smooth' });
  }

  window.prevStep = function() { goTo(current - 1); };
  window.nextStep = function() { goTo(current + 1); };
  window.goToStep = function(n) { goTo(n); };
  window.jumpToQuiz = function() { goTo(steps.length - 1); };

  document.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowRight') nextStep();
    if (e.key === 'ArrowLeft') prevStep();
  });

  document.addEventListener('DOMContentLoaded', initStepper);
})();
