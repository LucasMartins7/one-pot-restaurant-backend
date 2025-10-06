from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.String(100), unique=True, nullable=False)
    payment_id = db.Column(db.String(100), nullable=True)
    
    # Customer information
    customer_name = db.Column(db.String(100), nullable=False)
    customer_phone = db.Column(db.String(20), nullable=False)
    customer_email = db.Column(db.String(100), nullable=True)
    customer_address = db.Column(db.Text, nullable=False)
    customer_cep = db.Column(db.String(10), nullable=False)
    
    # Order details
    subtotal = db.Column(db.Float, nullable=False)
    delivery_fee = db.Column(db.Float, nullable=False, default=0.0)
    total = db.Column(db.Float, nullable=False)
    
    # Payment information
    payment_method = db.Column(db.String(20), nullable=False)  # 'pix' or 'credit_card'
    payment_status = db.Column(db.String(20), nullable=False, default='pending')
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'payment_id': self.payment_id,
            'customer_name': self.customer_name,
            'customer_phone': self.customer_phone,
            'customer_email': self.customer_email,
            'customer_address': self.customer_address,
            'customer_cep': self.customer_cep,
            'subtotal': self.subtotal,
            'delivery_fee': self.delivery_fee,
            'total': self.total,
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'items': [item.to_dict() for item in self.items]
        }

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    
    # Item details
    item_id = db.Column(db.String(50), nullable=False)
    item_name = db.Column(db.String(100), nullable=False)
    item_price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'item_id': self.item_id,
            'item_name': self.item_name,
            'item_price': self.item_price,
            'quantity': self.quantity,
            'total_price': self.total_price,
            'created_at': self.created_at.isoformat()
        }
