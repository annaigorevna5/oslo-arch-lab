document.addEventListener('DOMContentLoaded', function() {
    
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            menuToggle.innerHTML = navMenu.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
    }
    
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
    
    const calcForm = document.getElementById('calcForm');
    const calcResult = document.getElementById('calcResult');
    const totalCostEl = document.getElementById('totalCost');
    const rateInfoEl = document.getElementById('rateInfo');
    
    if (calcForm) {
        calcForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const area = parseFloat(document.getElementById('area').value);
            const projectType = document.getElementById('projectType').value;
            
            if (!area || area <= 0) {
                alert('Please enter a valid area.');
                return;
            }
            
            totalCostEl.textContent = 'Calculating...';
            rateInfoEl.textContent = '';
            calcResult.style.display = 'block';
            
            fetch('/api/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    area: area,
                    type: projectType
                })
            })
            .then(response => response.json())
            .then(data => {
                totalCostEl.textContent = data.total;
                rateInfoEl.textContent = `Based on rate: ${data.rate}`;
                calcResult.scrollIntoView({ behavior: 'smooth' });
            })
            .catch(error => {
                console.error('Error:', error);
                totalCostEl.textContent = 'Error';
                rateInfoEl.textContent = 'Could not calculate. Please try again.';
            });
        });
    }
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.service-card, .supplier-card, .portfolio-card').forEach(card => {
        observer.observe(card);
    });
    
    const style = document.createElement('style');
    style.textContent = `
        .service-card, .supplier-card, .portfolio-card {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .service-card.animate-in, .supplier-card.animate-in, .portfolio-card.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
});