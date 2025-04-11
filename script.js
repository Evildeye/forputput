// Dark Mode Toggle
const themeToggle = document.querySelector('.theme-toggle');
let darkMode = localStorage.getItem('darkMode') === 'enabled';

const enableDarkMode = () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('darkMode', 'enabled');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

const disableDarkMode = () => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('darkMode', 'disabled');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
}

if (darkMode) enableDarkMode();

themeToggle.addEventListener('click', () => {
    darkMode = !darkMode;
    darkMode ? enableDarkMode() : disableDarkMode();
});

// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    navLinks.classList.toggle('active');
});

// Close menu saat klik di luar
document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-links') && !e.target.closest('.menu-toggle')) {
        navLinks.classList.remove('active');
    }
});

// Scroll Animation
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.scroll-reveal').forEach((el) => observer.observe(el));

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
});
