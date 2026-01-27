document.addEventListener('DOMContentLoaded', function() {
    
    // 1. ПЛАВНАЯ НАВИГАЦИЯ
    const navbar = document.getElementById('mainNav');
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Мобильное меню
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
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
    
    // 2. АНИМАЦИЯ ПОЯВЛЕНИЯ ЭЛЕМЕНТОВ ПРИ СКРОЛЛЕ
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const revealPoint = 150;
        
        revealElements.forEach(element => {
            const revealTop = element.getBoundingClientRect().top;
            
            if (revealTop < windowHeight - revealPoint) {
                element.classList.add('active');
            }
        });
    };
    
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); 
    
    // 3. ПЛАВНЫЙ СКРОЛЛ К СЕКЦИЯМ
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 4. ИНТЕРАКТИВНЫЙ КАЛЬКУЛЯТОР 
    const updateCalculatorPreview = () => {
        const area = document.getElementById('areaRange')?.value || 150;
        const rooms = document.getElementById('roomsRange')?.value || 3;
        const quality = document.getElementById('qualityRange')?.value || 2;
        
        // Расчет стоимости
        const basePrice = 30000; // NOK per m²
        const roomMultiplier = 1 + (rooms - 3) * 0.1;
        const qualityMultiplier = 0.8 + quality * 0.2;
        
        const totalCost = Math.round(area * basePrice * roomMultiplier * qualityMultiplier);
        
        // Форматирование числа
        const formattedCost = new Intl.NumberFormat('no-NO').format(totalCost);
        
        // Обновление отображения
        const costElement = document.getElementById('previewCost');
        if (costElement) {
            costElement.textContent = formattedCost + ' NOK';
        }
        
        // Обновление 3D визуализации
        const visualization = document.getElementById('calcVisualization');
        if (visualization) {
            const size = 100 + area * 0.5;
            const height = 50 + rooms * 20;
            
            visualization.style.background = `linear-gradient(135deg, 
                rgba(26, 75, 109, ${0.3 + quality * 0.1}), 
                rgba(77, 184, 201, ${0.2 + quality * 0.1})
            )`;
            
            visualization.innerHTML = `
                <div style="
                    width: ${size}px;
                    height: ${height}px;
                    background: rgba(255, 255, 255, 0.9);
                    border-radius: 10px;
                    position: relative;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    display: flex;
                    flex-wrap: wrap;
                    padding: 10px;
                ">
                    ${Array.from({length: rooms}).map((_, i) => `
                        <div style="
                            width: ${100/rooms}%;
                            height: 50%;
                            border: 2px solid rgba(26, 75, 109, 0.2);
                            border-radius: 5px;
                            margin: 1px;
                        "></div>
                    `).join('')}
                </div>
            `;
        }
    };
    
    // Инициализация калькулятора
    document.querySelectorAll('.range-slider').forEach(slider => {
        slider.addEventListener('input', updateCalculatorPreview);
    });
    
    if (document.getElementById('areaRange')) {
        updateCalculatorPreview();
    }
    
    // 5. ГОРИЗОНТАЛЬНАЯ ГАЛЕРЕЯ
    const initHorizontalGallery = () => {
        const gallery = document.querySelector('.horizontal-gallery');
        if (!gallery) return;
        
        let isDown = false;
        let startX;
        let scrollLeft;
        
        gallery.addEventListener('mousedown', (e) => {
            isDown = true;
            gallery.classList.add('active');
            startX = e.pageX - gallery.offsetLeft;
            scrollLeft = gallery.scrollLeft;
        });
        
        gallery.addEventListener('mouseleave', () => {
            isDown = false;
            gallery.classList.remove('active');
        });
        
        gallery.addEventListener('mouseup', () => {
            isDown = false;
            gallery.classList.remove('active');
        });
        
        gallery.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - gallery.offsetLeft;
            const walk = (x - startX) * 2;
            gallery.scrollLeft = scrollLeft - walk;
        });
        
        // Карусель для мобильных устройств
        let startTouchX;
        
        gallery.addEventListener('touchstart', (e) => {
            startTouchX = e.touches[0].pageX;
        }, {passive: true});
        
        gallery.addEventListener('touchmove', (e) => {
            if (!startTouchX) return;
            const currentTouchX = e.touches[0].pageX;
            const diff = startTouchX - currentTouchX;
            gallery.scrollLeft += diff;
            startTouchX = currentTouchX;
        }, {passive: true});
    };
    
    initHorizontalGallery();
    
    // 6. АНИМАЦИЯ ПЕРЕКЛЮЧЕНИЯ ЯЗЫКА
    document.querySelectorAll('.lang-link').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.classList.contains('active')) {
                e.preventDefault();
                return;
            }
            
            // Анимация исчезновения контента
            document.querySelector('main').style.opacity = '0';
            document.querySelector('main').style.transition = 'opacity 0.3s ease';
            
            setTimeout(() => {
                window.location.href = this.href;
            }, 300);
        });
    });
    
    // 7. ПАРАЛЛАКС ЭФФЕКТ ДЛЯ ГЕРОЙ-СЕКЦИИ
    const initParallax = () => {
        const hero = document.querySelector('.hero');
        if (!hero) return;
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            const video = hero.querySelector('.hero-video');
            if (video) {
                video.style.transform = `translateY(${rate}px)`;
            }
        });
    };
    
    initParallax();
    
    // 8. СЛУЧАЙНЫЕ СВЕТЛЯЧКИ 
    const createFireflies = () => {
        const hero = document.querySelector('.hero');
        if (!hero) return;
        
        for (let i = 0; i < 15; i++) {
            const firefly = document.createElement('div');
            firefly.className = 'firefly';
            
            // Случайная позиция
            firefly.style.left = `${Math.random() * 100}%`;
            firefly.style.top = `${Math.random() * 100}%`;
            
            // Случайная задержка анимации
            firefly.style.animationDelay = `${Math.random() * 8}s`;
            
            hero.appendChild(firefly);
        }
    };
    
    // 9. ИНТЕРАКТИВНЫЕ КАРТОЧКИ УСЛУГ
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // 10. LAZY LOADING ДЛЯ ИЗОБРАЖЕНИЙ
    const lazyLoadImages = () => {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    
                    if (src) {
                        img.src = src;
                        img.classList.add('loaded');
                    }
                    
                    observer.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    };
    
    lazyLoadImages();
    
    // 11. АНИМАЦИЯ ПРОГРЕСС-БАРА ПРИ СКРОЛЛЕ
    const initScrollProgress = () => {
        const progressBar = document.createElement('div');
        progressBar.id = 'scrollProgress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(to right, var(--color-aurora-purple), var(--color-aurora-teal));
            z-index: 10000;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);
        
        window.addEventListener('scroll', () => {
            const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = (window.scrollY / windowHeight) * 100;
            progressBar.style.width = scrolled + '%';
        });
    };
    
    initScrollProgress();
    
    // 12. СМЕНА ТЕМЫ 
    const initThemeByTime = () => {
        const hour = new Date().getHours();
        const body = document.body;
        
        if (hour >= 19 || hour < 7) {
            body.classList.add('night-mode');
        } else {
            body.classList.add('day-mode');
        }
    };
    
    initThemeByTime();
});

// 13. ПРЕДЗАГРУЗЧИК
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
    document.querySelector('main').style.opacity = '1';
    document.querySelector('main').style.transition = 'opacity 0.5s ease';
});