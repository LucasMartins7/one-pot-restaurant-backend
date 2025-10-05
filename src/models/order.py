from datetime import datetime
import json
from src.models.user import db

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(100), nullable=False)
    customer_phone = db.Column(db.String(20), nullable=False)
    customer_email = db.Column(db.String(100), nullable=True)
    
    # Endereço
    address = db.Column(db.String(200), nullable=False)
    number = db.Column(db.String(10), nullable=False)
    complement = db.Column(db.String(100), nullable=True)
    neighborhood = db.Column(db.String(100), nullable=True)
    city = db.Column(db.String(100), nullable=False, default='São Paulo')
    state = db.Column(db.String(2), nullable=False, default='SP')
    cep = db.Column(db.String(10), nullable=False)
    
    # Itens do pedido (JSON)
    items = db.Column(db.Text, nullable=False)  # JSON string
    
    # Valores
    subtotal = db.Column(db.Float, nullable=False)
    delivery_fee = db.Column(db.Float, nullable=False)
    total = db.Column(db.Float, nullable=False)
    
    # Pagamento
    payment_method = db.Column(db.String(50), nullable=False)
    payment_status = db.Column(db.String(20), nullable=False, default='pending')
    mercadopago_payment_id = db.Column(db.String(100), nullable=True)
    
    # Observações
    observations = db.Column(db.Text, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Order {self.id} - {self.customer_name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'customer_name': self.customer_name,
            'customer_phone': self.customer_phone,
            'customer_email': self.customer_email,
            'address': self.address,
            'number': self.number,
            'complement': self.complement,
            'neighborhood': self.neighborhood,
            'city': self.city,
            'state': self.state,
            'cep': self.cep,
            'items': json.loads(self.items) if self.items else [],
            'subtotal': self.subtotal,
            'delivery_fee': self.delivery_fee,
            'total': self.total,
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'mercadopago_payment_id': self.mercadopago_payment_id,
            'observations': self.observations,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def set_items(self, items_list):
        """Converte lista de itens para JSON string"""
        self.items = json.dumps(items_list)
    
    def get_items(self):
        """Retorna lista de itens a partir do JSON string"""
        return json.loads(self.items) if self.items else []
