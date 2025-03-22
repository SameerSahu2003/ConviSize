// DOM Elements
const loginBox = document.getElementById('loginBox');
const signupBox = document.getElementById('signupBox');
const showSignupLink = document.getElementById('showSignup');
const showLoginLink = document.getElementById('showLogin');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const selectPlanButtons = document.querySelectorAll('.select-plan-btn');
const homeButton = document.getElementById('homeButton');

// Event Listeners
document.addEventListener('DOMContentLoaded', initPremiumPage);

// Initialize Premium Page
function initPremiumPage() {
  // Home button click handler
  homeButton.addEventListener('click', () => {
    window.location.href = 'Index.html';
  });
  
  // Toggle between login and signup forms
  showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginBox.classList.add('hidden');
    signupBox.classList.remove('hidden');
  });

  showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    signupBox.classList.add('hidden');
    loginBox.classList.remove('hidden');
  });

  // Handle login form submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.querySelector('input[type="email"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;

    try {
      // Here you would typically make an API call to your backend
      console.log('Login attempt:', { email });
      // Simulate successful login
      alert('Login successful! Please select a plan.');
      loginForm.reset();
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  });

  // Handle signup form submission
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = signupForm.querySelector('input[type="text"]').value;
    const email = signupForm.querySelector('input[type="email"]').value;
    const password = signupForm.querySelector('input[type="password"]').value;

    try {
      // Here you would typically make an API call to your backend
      console.log('Signup attempt:', { name, email });
      // Simulate successful signup
      alert('Signup successful! Please select a plan.');
      signupForm.reset();
    } catch (error) {
      console.error('Signup error:', error);
      alert('Signup failed. Please try again.');
    }
  });

  // Handle plan selection
  selectPlanButtons.forEach(button => {
    button.addEventListener('click', () => {
      const plan = button.getAttribute('data-plan');
      const amount = plan === 'monthly' ? '9.99' : '89.99';
      
      // Here you would typically integrate with a payment processor like Stripe
      alert(`Proceeding to payment for ${plan} plan ($${amount})...`);
      // Redirect to payment processor or open payment modal
    });
  });
}