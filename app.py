from flask import Flask, render_template, request, session, jsonify, redirect, url_for, flash
from flask_babel import Babel
from flask_sqlalchemy import SQLAlchemy
from config import Config
import json
import os
from datetime import datetime
import requests
from translations import translations

app = Flask(__name__)
app.config.from_object(Config)

# Настройка базы данных для Render
import re
db_url = os.environ.get('DATABASE_URL', 'sqlite:///app.db')
if db_url and db_url.startswith('postgres://'):
    db_url = db_url.replace('postgres://', 'postgresql://', 1)
app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Импортируем модели после инициализации db
from models import ContactMessage, Project, Supplier, BlogPost, Testimonial

# Кастомная функция перевода
def translate_text(text, lang='en'):
    return translations.get(lang, {}).get(text, text)

def get_locale():
    if 'language' in session:
        return session['language']
    return request.accept_languages.best_match(app.config['LANGUAGES'].keys())

babel = Babel(app, locale_selector=get_locale)

@app.context_processor
def inject_template_variables():
    def translate(text):
        lang = session.get('language', 'en')
        return translate_text(text, lang)
    
    return dict(
        _=translate,
        get_locale=get_locale,
        current_year=datetime.now().year
    )

@app.route('/set_language/<language>')
def set_language(language):
    if language in app.config['LANGUAGES']:
        session['language'] = language
    previous_page = request.referrer
    if previous_page:
        return redirect(previous_page)
    else:
        return redirect(url_for('index'))

@app.route('/')
def index():
    try:
        # Защита от ошибки если таблица не существует
        featured_projects = Project.query.filter_by(featured=True).limit(3).all() if db.engine.has_table('project') else []
        featured_posts = BlogPost.query.filter_by(published=True).order_by(BlogPost.created_at.desc()).limit(2).all() if db.engine.has_table('blog_post') else []
    except:
        featured_projects = []
        featured_posts = []
    
    return render_template('index.html', page_title="Nordic Dwelling", featured_projects=featured_projects, featured_posts=featured_posts)

@app.route('/calculator')
def calculator():
    return render_template('calculator.html', page_title="Calculator")

@app.route('/suppliers')
def suppliers():
    try:
        suppliers_data = Supplier.query.all() if db.engine.has_table('supplier') else []
    except:
        suppliers_data = []
    return render_template('suppliers.html', page_title="Suppliers & Stores", suppliers=suppliers_data)

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        try:
            name = request.form.get('name')
            email = request.form.get('email')
            phone = request.form.get('phone')
            project_type = request.form.get('project_type')
            message = request.form.get('message')
            newsletter = 'newsletter' in request.form
            
            new_message = ContactMessage(
                name=name,
                email=email,
                phone=phone,
                project_type=project_type,
                message=message,
                newsletter=newsletter,
                ip_address=request.remote_addr
            )
            
            db.session.add(new_message)
            db.session.commit()
            
            return jsonify({'status': 'success', 'message': 'Thank you for your message!'})
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'status': 'error', 'message': 'An error occurred. Please try again.'}), 500
    
    return render_template('contact.html', page_title="Contact")

@app.route('/portfolio')
def portfolio():
    try:
        projects = Project.query.all() if db.engine.has_table('project') else []
    except:
        projects = []
    return render_template('portfolio.html', page_title="Portfolio", projects=projects)

@app.route('/blog')
def blog():
    try:
        posts = BlogPost.query.filter_by(published=True).order_by(BlogPost.created_at.desc()).all() if db.engine.has_table('blog_post') else []
        featured_post = posts[0] if posts else None
    except:
        posts = []
        featured_post = None
    return render_template('blog.html', page_title="Blog", posts=posts, featured_post=featured_post)

@app.route('/blog/<slug>')
def blog_post(slug):
    try:
        if db.engine.has_table('blog_post'):
            post = BlogPost.query.filter_by(slug=slug, published=True).first_or_404()
            post.views += 1
            db.session.commit()
            return render_template('blog_post.html', page_title=post.title, post=post)
        else:
            return render_template('404.html'), 404
    except:
        return render_template('404.html'), 404

@app.route('/testimonials')
def testimonials():
    try:
        testimonials_data = Testimonial.query.filter_by(approved=True).order_by(Testimonial.created_at.desc()).all() if db.engine.has_table('testimonial') else []
    except:
        testimonials_data = []
    return render_template('testimonials.html', page_title="Testimonials", testimonials=testimonials_data)

@app.route('/about')
def about():
    return render_template('about.html', page_title="About Us")

@app.route('/api/calculate', methods=['POST'])
def calculate_cost():
    data = request.get_json()
    area = float(data.get('area', 0))
    project_type = data.get('type', 'basic_remodel')
    
    rates = {
        'basic_remodel': 15000,
        'full_renovation': 25000,
        'new_design': 35000,
        'luxury': 50000
    }
    
    base_rate = rates.get(project_type, 15000)
    total = area * base_rate
    
    formatted_total = f"{total:,.0f}".replace(',', ' ') + ' NOK'
    
    return jsonify({
        'total': formatted_total,
        'rate': f"{base_rate:,.0f} NOK/sqm"
    })

@app.route('/admin')
def admin_panel():
    # Для админки просто возвращаем шаблон без запросов к базе
    return render_template('admin.html', page_title="Admin Panel")

@app.route('/admin/message/<int:message_id>')
def get_message(message_id):
    try:
        if db.engine.has_table('contact_message'):
            message = ContactMessage.query.get_or_404(message_id)
            return jsonify({
                'id': message.id,
                'name': message.name,
                'email': message.email,
                'phone': message.phone,
                'project_type': message.project_type,
                'message': message.message,
                'created_at': message.created_at.isoformat() if message.created_at else None,
                'ip_address': message.ip_address
            })
        else:
            return jsonify({'error': 'Database table not found'}), 404
    except:
        return jsonify({'error': 'Message not found'}), 404

@app.route('/admin/init-db')
def init_db():
    with app.app_context():
        try:
            db.create_all()
            
            # Проверяем, пустая ли база, и добавляем тестовые данные
            if db.engine.has_table('project') and Project.query.count() == 0:
                projects = [
                    Project(
                        title='Modern Villa in Frogner',
                        category='residential new-build',
                        location='Frogner, Oslo',
                        area='240 m²',
                        duration='10 months',
                        year='2023',
                        description='A contemporary family home with sustainable materials and smart home integration.',
                        image_url='https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                        featured=True
                    ),
                    Project(
                        title='Loft Apartment Renovation',
                        category='residential renovation',
                        location='Grünerløkka, Oslo',
                        area='85 m²',
                        duration='4 months',
                        year='2023',
                        description='Complete transformation of a 1920s apartment with open-plan living and industrial elements.',
                        image_url='https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                        featured=True
                    ),
                    Project(
                        title='Tech Office Interior',
                        category='commercial',
                        location='Majorstuen, Oslo',
                        area='450 m²',
                        duration='6 months',
                        year='2022',
                        description='Scandinavian-inspired workspace with collaborative areas and ergonomic design.',
                        image_url='https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                        featured=True
                    )
                ]
                
                for project in projects:
                    db.session.add(project)
            
            if db.engine.has_table('blog_post') and BlogPost.query.count() == 0:
                posts = [
                    BlogPost(
                        title='Nordic Design Principles for Modern Homes',
                        slug='nordic-design-principles',
                        excerpt='Learn how to incorporate Scandinavian design elements into your Oslo home for a timeless, functional aesthetic.',
                        content='Full blog post content here...',
                        author='Mikael Johansen',
                        image_url='https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                        published=True,
                        views=42
                    ),
                    BlogPost(
                        title='Sustainable Building Materials Available in Oslo',
                        slug='sustainable-building-materials',
                        excerpt='A guide to eco-friendly construction materials that are locally sourced and perfect for Norwegian climate.',
                        content='Full blog post content here...',
                        author='Ingrid Larsen',
                        image_url='https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                        published=True,
                        views=38
                    )
                ]
                
                for post in posts:
                    db.session.add(post)
            
            if db.engine.has_table('testimonial') and Testimonial.query.count() == 0:
                testimonials = [
                    Testimonial(
                        client_name='Anders & Lena Johansen',
                        project_type='Frogner Villa Renovation',
                        rating=5,
                        content='Nordic Dwelling transformed our 1920s villa into a modern, energy-efficient home while preserving its character.',
                        approved=True,
                        location='Frogner, Oslo'
                    ),
                    Testimonial(
                        client_name='Maria Chen',
                        project_type='Grünerløkka Apartment',
                        rating=5,
                        content='As a first-time homeowner in Oslo, I was nervous about renovation. Nordic Dwelling guided me through every step.',
                        approved=True,
                        location='Grünerløkka, Oslo'
                    )
                ]
                
                for testimonial in testimonials:
                    db.session.add(testimonial)
            
            db.session.commit()
            return 'Database initialized successfully with sample data!'
            
        except Exception as e:
            return f'Error initializing database: {str(e)}'

@app.route('/health')
def health_check():
    """Проверка работоспособности сайта"""
    return jsonify({'status': 'ok', 'message': 'Site is running'})

if __name__ == '__main__':
    # Создаем таблицы при запуске
    with app.app_context():
        db.create_all()
    
    if not os.path.exists('data'):
        os.makedirs('data')
    
    app.run(host='0.0.0.0', port=5000, debug=False)