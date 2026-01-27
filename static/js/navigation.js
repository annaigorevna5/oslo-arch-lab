document.addEventListener('DOMContentLoaded', function() {
    // 1. ПЛАВНАЯ НАВИГАЦИЯ С ЭФФЕКТОМ СТЕКЛА
    const navbar = document.getElementById('mainNav');
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    // Эффект при скролле
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Мобильное меню
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.innerHTML = navMenu.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
        
        // Закрытие меню при клике на ссылку
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                if (menuToggle) {
                    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
        });
    }
    
    // 2. ПЛАВНЫЙ СКРОЛЛ К СЕКЦИЯМ
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#' || href === '#!') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
                
                // Закрываем мобильное меню если открыто
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    if (menuToggle) {
                        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                    }
                }
            }
        });
    });
    
    // 3. ПЕРЕКЛЮЧЕНИЕ ЯЗЫКА
    document.querySelectorAll('.lang-link').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.classList.contains('active')) {
                e.preventDefault();
                return;
            }
            
            // Анимация перехода
            document.querySelector('main').style.opacity = '0.7';
            document.querySelector('main').style.transition = 'opacity 0.3s ease';
            
            setTimeout(() => {
                console.log('Language change to:', this.dataset.lang);
            }, 300);
        });
    });
    
    // 4. АКТИВНЫЙ ПУНКТ МЕНЮ ПРИ СКРОЛЛЕ
    const sections = document.querySelectorAll('section[id], .section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    function setActiveNavLink() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', setActiveNavLink);
    
    // 5. ПРЕДЗАГРУЗЧИК
    window.addEventListener('load', () => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            setTimeout(() => {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 500);
            }, 1000);
        }
        
        // Анимация появления контента после загрузки
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.style.opacity = '1';
            mainContent.style.transition = 'opacity 0.5s ease';
        }
    });
    
    // 6. КНОПКИ "НАВЕРХ"
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    scrollToTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--color-fjord);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
        z-index: 999;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: var(--shadow-medium);
    `;
    
    document.body.appendChild(scrollToTopBtn);
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollToTopBtn.style.opacity = '1';
            scrollToTopBtn.style.transform = 'translateY(0)';
        } else {
            scrollToTopBtn.style.opacity = '0';
            scrollToTopBtn.style.transform = 'translateY(20px)';
        }
    });
    
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // 7. ПОДСВЕТКА ФОРМ ПРИ ФОКУСЕ
    document.querySelectorAll('input, textarea, select').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
    
    // 8. ПРОВЕРКА ПОДДЕРЖКИ WEBP
    function checkWebPSupport() {
        const elem = document.createElement('canvas');
        if (!!(elem.getContext && elem.getContext('2d'))) {
            return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        }
        return false;
    }
    
    const supportsWebP = checkWebPSupport();
    if (!supportsWebP) {
        document.body.classList.add('no-webp');
    }
});

// 9. УТИЛИТЫ ДЛЯ ВСЕХ СТРАНИЦ
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 10. МЕЖДУНАРОДНОЕ ФОРМАТИРОВАНИЕ ЧИСЕЛ
function formatNumber(number, locale = 'no-NO') {
    return new Intl.NumberFormat(locale).format(number);
}

function formatCurrency(amount, currency = 'NOK', locale = 'no-NO') {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// 11. ОБРАБОТКА ОШИБОК ИЗОБРАЖЕНИЙ
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f1f5f9"/><text x="200" y="150" text-anchor="middle" fill="%2394a3b8" font-family="Arial" font-size="16">Image not available</text></svg>';
            this.alt = 'Image not available';
        });
    });
});