from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class ContactMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    project_type = db.Column(db.String(50))
    message = db.Column(db.Text, nullable=False)
    newsletter = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    ip_address = db.Column(db.String(50))
    
    def __repr__(self):
        return f'<ContactMessage {self.name}>'

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(100))
    area = db.Column(db.String(50))
    duration = db.Column(db.String(50))
    year = db.Column(db.String(10))
    description = db.Column(db.Text)
    image_url = db.Column(db.String(500))
    featured = db.Column(db.Boolean, default=False)
    
    def __repr__(self):
        return f'<Project {self.title}>'

class Supplier(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(100))
    address = db.Column(db.String(300))
    phone = db.Column(db.String(50))
    website = db.Column(db.String(200))
    description = db.Column(db.Text)
    rating = db.Column(db.Float, default=0.0)
    
    def __repr__(self):
        return f'<Supplier {self.name}>'

class BlogPost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False)
    excerpt = db.Column(db.Text)
    content = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(100))
    image_url = db.Column(db.String(500))
    published = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    views = db.Column(db.Integer, default=0)
    
    def __repr__(self):
        return f'<BlogPost {self.title}>'

class Testimonial(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_name = db.Column(db.String(100), nullable=False)
    project_type = db.Column(db.String(100))
    rating = db.Column(db.Integer, nullable=False)
    content = db.Column(db.Text, nullable=False)
    approved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    location = db.Column(db.String(100))
    
    def __repr__(self):
        return f'<Testimonial {self.client_name}>'