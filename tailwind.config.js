/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-dark': '#2D2D3A',
        'custom-light': '#F2F2F2',
        'custom-dark-purple': '#4F14A0',
        'custom-light-purple': '#8066FF',
        'custom-black': '#222222',
        'custom-light-dark': '#4E546A'
      },
    },
    backgroundImage: {
      'login-ligth': "url('assets/background/login-bg-ligth.png')",
      'login-dark': "url('assets/background/login-bg-dark.png')",
      'sign-up': "url('assets/background/signup-bg.png')",
    }
  },
  plugins: [
    // require('@tailwindcss/forms')
  ],
}

