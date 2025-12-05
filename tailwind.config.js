/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'sidebar': '#6B8E6B',
          'sidebar-hover': 'rgba(122, 183, 122, 0.4)',
          'login-card': '#68BE6B',
          'login-button': '#FDB7B7',
          'login-bg': '#E5E5E5',
        },
        fontFamily: {
          'poppins': ['Poppins', 'sans-serif'],
        },
        borderRadius: {
          '20': '20px',
        },
      },
    },
    plugins: [],
  }