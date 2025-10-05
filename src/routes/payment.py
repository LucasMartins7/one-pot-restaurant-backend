from flask import Blueprint, request, jsonify
import mercadopago
from mercadopago.config import RequestOptions
import uuid
import os
import json
from src.models.order import Order, db

payment_bp = Blueprint('payment', __name__)

# Configuração do Mercado Pago
# Em produção, essas chaves devem vir de variáveis de ambiente
MERCADOPAGO_ACCESS_TOKEN = os.getenv('MERCADOPAGO_ACCESS_TOKEN', 'TEST-3110328722128258-100514-63e7dc670655b03344e180477a3d5da3-190968069')
MERCADOPAGO_PUBLIC_KEY = os.getenv('MERCADOPAGO_PUBLIC_KEY', 'TEST-ae034fa4-581f-4e04-a922-4fcf697872f4')

sdk = mercadopago.SDK(MERCADOPAGO_ACCESS_TOKEN)

def calculate_delivery_fee(cep):
    """Calcula a taxa de entrega baseada no CEP"""
    if not cep or len(cep) < 8:
        return 0
    
    # Remove caracteres não numéricos
    cep_clean = ''.join(filter(str.isdigit, cep))
    
    if len(cep_clean) >= 1:
        first_digit = int(cep_clean[0])
        if first_digit <= 2:
            return 5.90  # Região central
        elif first_digit <= 5:
            return 8.90  # Região próxima
        else:
            return 12.90  # Região distante
    
    return 8.90  # Taxa padrão

@payment_bp.route('/process_card_payment', methods=['POST'])
def process_card_payment():
    """Processa pagamento com cartão de crédito"""
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        required_fields = ['token', 'customer_data', 'items', 'subtotal']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Campo obrigatório: {field}'}), 400
        
        customer_data = data['customer_data']
        items = data['items']
        subtotal = float(data['subtotal'])
        delivery_fee = calculate_delivery_fee(customer_data.get('cep', ''))
        total = subtotal + delivery_fee
        
        # Criar pedido no banco de dados
        order = Order(
            customer_name=customer_data['name'],
            customer_phone=customer_data['phone'],
            customer_email=customer_data.get('email', ''),
            address=customer_data['address'],
            number=customer_data['number'],
            complement=customer_data.get('complement', ''),
            neighborhood=customer_data.get('neighborhood', ''),
            city=customer_data.get('city', 'São Paulo'),
            state=customer_data.get('state', 'SP'),
            cep=customer_data['cep'],
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            total=total,
            payment_method='credit_card',
            observations=customer_data.get('observations', '')
        )
        order.set_items(items)
        
        db.session.add(order)
        db.session.commit()
        
        # Preparar dados para o Mercado Pago
        payment_data = {
            "transaction_amount": total,
            "token": data['token'],
            "description": f"Pedido One Pot #{order.id}",
            "installments": int(data.get('installments', 1)),
            "payment_method_id": data.get('payment_method_id'),
            "issuer_id": data.get('issuer_id'),
            "payer": {
                "email": customer_data.get('email', 'cliente@onepot.com'),
                "identification": {
                    "type": data.get('identification_type', 'CPF'),
                    "number": data.get('identification_number', '00000000000')
                }
            },
            "external_reference": str(order.id),
            "notification_url": f"{request.host_url}api/webhook_mercadopago"
        }
        
        # Gerar chave de idempotência
        idempotency_key = str(uuid.uuid4())
        
        # Processar pagamento no Mercado Pago
        request_options = RequestOptions()
        request_options.custom_headers = {"X-Idempotency-Key": idempotency_key}
        payment_response = sdk.payment().create(payment_data, request_options)



        
        if payment_response["status"] == 201:
            payment_result = payment_response["response"]
            
            # Atualizar pedido com ID do pagamento
            order.mercadopago_payment_id = str(payment_result["id"])
            order.payment_status = payment_result["status"]
            db.session.commit()
            
            return jsonify({
                'success': True,
                'order_id': order.id,
                'payment_id': payment_result["id"],
                'status': payment_result["status"],
                'status_detail': payment_result.get("status_detail"),
                'total': total
            })
        else:
            # Erro no pagamento
            order.payment_status = 'failed'
            db.session.commit()
            
            return jsonify({
                'success': False,
                'error': 'Erro ao processar pagamento',
                'details': payment_response.get("response", {})
            }), 400
            
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@payment_bp.route('/generate_pix_payment', methods=['POST'])
def generate_pix_payment():
    """Gera pagamento PIX"""
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        required_fields = ['customer_data', 'items', 'subtotal']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Campo obrigatório: {field}'}), 400
        
        customer_data = data['customer_data']
        items = data['items']
        subtotal = float(data['subtotal'])
        delivery_fee = calculate_delivery_fee(customer_data.get('cep', ''))
        total = subtotal + delivery_fee
        
        # Criar pedido no banco de dados
        order = Order(
            customer_name=customer_data['name'],
            customer_phone=customer_data['phone'],
            customer_email=customer_data.get('email', ''),
            address=customer_data['address'],
            number=customer_data['number'],
            complement=customer_data.get('complement', ''),
            neighborhood=customer_data.get('neighborhood', ''),
            city=customer_data.get('city', 'São Paulo'),
            state=customer_data.get('state', 'SP'),
            cep=customer_data['cep'],
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            total=total,
            payment_method='pix',
            observations=customer_data.get('observations', '')
        )
        order.set_items(items)
        
        db.session.add(order)
        db.session.commit()
        
        # Preparar dados para o PIX
        payment_data = {
            "transaction_amount": total,
            "description": f"Pedido One Pot #{order.id}",
            "payment_method_id": "pix",
            "payer": {
                "email": customer_data.get('email', 'cliente@onepot.com'),
                "first_name": customer_data['name'].split()[0],
                "last_name": ' '.join(customer_data['name'].split()[1:]) if len(customer_data['name'].split()) > 1 else '',
                "identification": {
                    "type": "CPF",
                    "number": "00000000000"  # Em produção, coletar CPF real
                }
            },
            "external_reference": str(order.id),
            "notification_url": f"{request.host_url}api/webhook_mercadopago"
        }
        
        # Gerar chave de idempotência
        idempotency_key = str(uuid.uuid4())
        
        # Criar pagamento PIX no Mercado Pago
        request_options = RequestOptions()
        request_options.custom_headers = {"X-Idempotency-Key": idempotency_key}
        payment_response = sdk.payment().create(payment_data, request_options)




        
        if payment_response["status"] == 201:
            payment_result = payment_response["response"]
            
            # Atualizar pedido com ID do pagamento
            order.mercadopago_payment_id = str(payment_result["id"])
            order.payment_status = payment_result["status"]
            db.session.commit()
            
            # Extrair dados do PIX
            pix_data = payment_result.get("point_of_interaction", {}).get("transaction_data", {})
            
            return jsonify({
                'success': True,
                'order_id': order.id,
                'payment_id': payment_result["id"],
                'status': payment_result["status"],
                'pix_code': pix_data.get("qr_code"),
                'pix_qr_base64': pix_data.get("qr_code_base64"),
                'total': total,
                'expiration_date': payment_result.get("date_of_expiration")
            })
        else:
            # Erro no pagamento
            order.payment_status = 'failed'
            db.session.commit()
            
            print(f"Erro ao gerar PIX: {payment_response.get("response", {})}")
            return jsonify({
                'success': False,
                'error': 'Erro ao gerar PIX',
                'details': payment_response.get("response", {})
            }), 400
            
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@payment_bp.route('/check_payment_status/<int:order_id>', methods=['GET'])
def check_payment_status(order_id):
    """Verifica o status de um pagamento"""
    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'error': 'Pedido não encontrado'}), 404
        
        if order.mercadopago_payment_id:
            # Consultar status no Mercado Pago
            payment_response = sdk.payment().get(order.mercadopago_payment_id)
            
            if payment_response["status"] == 200:
                payment_result = payment_response["response"]
                
                # Atualizar status local se necessário
                if order.payment_status != payment_result["status"]:
                    order.payment_status = payment_result["status"]
                    db.session.commit()
                
                return jsonify({
                    'order_id': order.id,
                    'payment_id': order.mercadopago_payment_id,
                    'status': payment_result["status"],
                    'status_detail': payment_result.get("status_detail"),
                    'total': order.total
                })
        
        return jsonify({
            'order_id': order.id,
            'status': order.payment_status,
            'total': order.total
        })
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@payment_bp.route('/webhook_mercadopago', methods=['POST'])
def webhook_mercadopago():
    """Webhook para receber notificações do Mercado Pago"""
    try:
        data = request.get_json()
        
        if data.get("type") == "payment":
            payment_id = data.get("data", {}).get("id")
            
            if payment_id:
                # Consultar pagamento no Mercado Pago
                payment_response = sdk.payment().get(payment_id)
                
                if payment_response["status"] == 200:
                    payment_result = payment_response["response"]
                    external_reference = payment_result.get("external_reference")
                    
                    if external_reference:
                        # Encontrar pedido pelo external_reference
                        order = Order.query.get(int(external_reference))
                        
                        if order:
                            # Atualizar status do pedido
                            order.payment_status = payment_result["status"]
                            db.session.commit()
                            
                            print(f"Pedido {order.id} atualizado para status: {payment_result['status']}")
        
        return jsonify({'status': 'ok'}), 200
        
    except Exception as e:
        print(f"Erro no webhook: {str(e)}")
        return jsonify({'error': 'Erro interno'}), 500

@payment_bp.route('/orders', methods=['GET'])
def get_orders():
    """Lista todos os pedidos"""
    try:
        orders = Order.query.order_by(Order.created_at.desc()).all()
        return jsonify([order.to_dict() for order in orders])
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@payment_bp.route('/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    """Obtém detalhes de um pedido específico"""
    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'error': 'Pedido não encontrado'}), 404
        
        return jsonify(order.to_dict())
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500
