
from flask import Flask, request, jsonify
from flask_cors import CORS
import mercadopago
import os
from dotenv import load_dotenv
from models import db, Order, OrderItem
from datetime import datetime

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, origins="*") # Enable CORS for all domains

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///onepot.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

# Initialize database
db.init_app(app)

# Initialize Mercado Pago SDK
MP_ACCESS_TOKEN = os.getenv('MP_ACCESS_TOKEN', "TEST-3110328722128258-100514-63e7dc670655b03344e180477a3d5da3-190968069")
mp = mercadopago.SDK(MP_ACCESS_TOKEN)

# Create tables
with app.app_context():
    db.create_all()

@app.route("/api/generate_pix_payment", methods=["POST"])
def generate_pix_payment():
    try:
        data = request.get_json()
        items = data.get("items")
        customer_data = data.get("customer_data")
        subtotal = data.get("subtotal")

        if not all([items, customer_data, subtotal]):
            return jsonify({"success": False, "error": "Missing required data"}), 400

        # Prepare payment data for Mercado Pago
        # This is a simplified example, adjust as per your Mercado Pago integration needs
        payment_data = {
            "transaction_amount": float(subtotal), # Use subtotal for now, delivery fee can be added later
            "description": "Pedido One Pot Paulista",
            "payment_method_id": "pix",
            "payer": {
                "email": customer_data.get("email", "test_user@example.com"),
                "first_name": customer_data.get("name", "Test").split(" ")[0],
                "last_name": "User", # Simplified
                "identification": {
                    "type": "CPF", # Assuming CPF for Brazil
                    "number": "11111111111" # Placeholder, ideally collected from user
                },
                "address": {
                    "zip_code": customer_data.get("cep", "00000000"),
                    "street_name": customer_data.get("address", "Rua Teste"),
                    "street_number": customer_data.get("number", "123")
                }
            }
        }

        # Create payment
        payment_response = mp.payment().create(payment_data)
        payment = payment_response["response"]

        if payment_response["status"] == 201:
            # Payment created successfully
            qr_code_base64 = None
            pix_code = None
            
            # Extract PIX data from payment response
            if "point_of_interaction" in payment and payment["point_of_interaction"]:
                transaction_data = payment["point_of_interaction"].get("transaction_data", {})
                pix_code = transaction_data.get("qr_code")
                qr_code_base64 = transaction_data.get("qr_code_base64")

            # Save order to database
            try:
                # Calculate delivery fee (you can adjust this logic)
                delivery_fee = 5.0 if float(subtotal) < 30.0 else 0.0
                total_amount = float(subtotal) + delivery_fee
                
                # Create order
                order = Order(
                    order_id=str(payment["id"]),
                    payment_id=str(payment["id"]),
                    customer_name=customer_data.get("name", ""),
                    customer_phone=customer_data.get("phone", ""),
                    customer_email=customer_data.get("email", ""),
                    customer_address=f"{customer_data.get('address', '')}, {customer_data.get('number', '')}",
                    customer_cep=customer_data.get("cep", ""),
                    subtotal=float(subtotal),
                    delivery_fee=delivery_fee,
                    total=total_amount,
                    payment_method="pix",
                    payment_status="pending"
                )
                
                db.session.add(order)
                db.session.flush()  # Get the order ID
                
                # Add order items
                for item in items:
                    order_item = OrderItem(
                        order_id=order.id,
                        item_id=str(item.get("id", "")),
                        item_name=item.get("name", ""),
                        item_price=float(item.get("price", 0)),
                        quantity=int(item.get("quantity", 1)),
                        total_price=float(item.get("price", 0)) * int(item.get("quantity", 1))
                    )
                    db.session.add(order_item)
                
                db.session.commit()
                app.logger.info(f"Order {payment['id']} saved to database")
                
            except Exception as db_error:
                db.session.rollback()
                app.logger.error(f"Error saving order to database: {db_error}")

            return jsonify({
                "success": True,
                "order_id": payment["id"],
                "payment_id": payment["id"],
                "status": payment["status"],
                "total": payment["transaction_amount"],
                "pix_code": pix_code,
                "pix_qr_base64": qr_code_base64,
                "expiration_date": payment.get("date_of_expiration")
            }), 201
        else:
            return jsonify({"success": False, "error": payment.get("message", "Erro ao criar pagamento PIX"), "details": payment}), payment_response["status"]

    except Exception as e:
        app.logger.error(f"Error processing PIX payment: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/process_card_payment", methods=["POST"])
def process_card_payment():
    try:
        data = request.get_json()
        items = data.get("items")
        customer_data = data.get("customer_data")
        subtotal = data.get("subtotal")
        card_data = data.get("card_data")

        if not all([items, customer_data, subtotal, card_data]):
            return jsonify({"success": False, "error": "Missing required data"}), 400

        # Prepare payment data for Mercado Pago
        payment_data = {
            "transaction_amount": float(subtotal),
            "description": "Pedido One Pot Paulista",
            "payment_method_id": card_data.get("payment_method_id"),
            "token": card_data.get("token"),
            "installments": card_data.get("installments", 1),
            "payer": {
                "email": customer_data.get("email", "test_user@example.com"),
                "first_name": customer_data.get("name", "Test").split(" ")[0],
                "last_name": "User",
                "identification": {
                    "type": "CPF",
                    "number": "11111111111"
                },
                "address": {
                    "zip_code": customer_data.get("cep", "00000000"),
                    "street_name": customer_data.get("address", "Rua Teste"),
                    "street_number": customer_data.get("number", "123")
                }
            }
        }

        # Create payment
        payment_response = mp.payment().create(payment_data)
        payment = payment_response["response"]

        if payment_response["status"] == 201:
            # Save order to database
            try:
                # Calculate delivery fee (you can adjust this logic)
                delivery_fee = 5.0 if float(subtotal) < 30.0 else 0.0
                total_amount = float(subtotal) + delivery_fee
                
                # Determine payment status
                payment_status = "approved" if payment["status"] == "approved" else "pending"
                
                # Create order
                order = Order(
                    order_id=str(payment["id"]),
                    payment_id=str(payment["id"]),
                    customer_name=customer_data.get("name", ""),
                    customer_phone=customer_data.get("phone", ""),
                    customer_email=customer_data.get("email", ""),
                    customer_address=f"{customer_data.get('address', '')}, {customer_data.get('number', '')}",
                    customer_cep=customer_data.get("cep", ""),
                    subtotal=float(subtotal),
                    delivery_fee=delivery_fee,
                    total=total_amount,
                    payment_method="credit_card",
                    payment_status=payment_status
                )
                
                db.session.add(order)
                db.session.flush()  # Get the order ID
                
                # Add order items
                for item in items:
                    order_item = OrderItem(
                        order_id=order.id,
                        item_id=str(item.get("id", "")),
                        item_name=item.get("name", ""),
                        item_price=float(item.get("price", 0)),
                        quantity=int(item.get("quantity", 1)),
                        total_price=float(item.get("price", 0)) * int(item.get("quantity", 1))
                    )
                    db.session.add(order_item)
                
                db.session.commit()
                app.logger.info(f"Order {payment['id']} saved to database")
                
            except Exception as db_error:
                db.session.rollback()
                app.logger.error(f"Error saving order to database: {db_error}")

            return jsonify({
                "success": True,
                "order_id": payment["id"],
                "payment_id": payment["id"],
                "status": payment["status"],
                "total": payment["transaction_amount"],
                "status_detail": payment.get("status_detail")
            }), 201
        else:
            return jsonify({"success": False, "error": payment.get("message", "Erro ao processar pagamento"), "details": payment}), payment_response["status"]

    except Exception as e:
        app.logger.error(f"Error processing card payment: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)



# Sales and reporting endpoints
@app.route("/api/orders", methods=["GET"])
def get_orders():
    """Get all orders with optional filtering"""
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        payment_method = request.args.get('payment_method')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Build query
        query = Order.query
        
        if status:
            query = query.filter(Order.payment_status == status)
        if payment_method:
            query = query.filter(Order.payment_method == payment_method)
        if start_date:
            query = query.filter(Order.created_at >= start_date)
        if end_date:
            query = query.filter(Order.created_at <= end_date)
        
        # Order by most recent first
        query = query.order_by(Order.created_at.desc())
        
        # Paginate
        orders = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            "success": True,
            "orders": [order.to_dict() for order in orders.items],
            "total": orders.total,
            "pages": orders.pages,
            "current_page": page
        })
        
    except Exception as e:
        app.logger.error(f"Error fetching orders: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/orders/<order_id>", methods=["GET"])
def get_order(order_id):
    """Get a specific order by ID"""
    try:
        order = Order.query.filter_by(order_id=order_id).first()
        if not order:
            return jsonify({"success": False, "error": "Order not found"}), 404
        
        return jsonify({
            "success": True,
            "order": order.to_dict()
        })
        
    except Exception as e:
        app.logger.error(f"Error fetching order {order_id}: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/sales-report", methods=["GET"])
def sales_report():
    """Generate sales report with statistics"""
    try:
        # Get query parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Build base query
        query = Order.query
        
        if start_date:
            query = query.filter(Order.created_at >= start_date)
        if end_date:
            query = query.filter(Order.created_at <= end_date)
        
        # Get all orders in the period
        orders = query.all()
        
        # Calculate statistics
        total_orders = len(orders)
        total_revenue = sum(order.total for order in orders)
        avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
        
        # Payment method breakdown
        pix_orders = [o for o in orders if o.payment_method == 'pix']
        card_orders = [o for o in orders if o.payment_method == 'credit_card']
        
        # Status breakdown
        approved_orders = [o for o in orders if o.payment_status == 'approved']
        pending_orders = [o for o in orders if o.payment_status == 'pending']
        
        # Most popular items
        item_stats = {}
        for order in orders:
            for item in order.items:
                if item.item_name not in item_stats:
                    item_stats[item.item_name] = {'quantity': 0, 'revenue': 0}
                item_stats[item.item_name]['quantity'] += item.quantity
                item_stats[item.item_name]['revenue'] += item.total_price
        
        # Sort items by quantity sold
        popular_items = sorted(item_stats.items(), key=lambda x: x[1]['quantity'], reverse=True)[:10]
        
        return jsonify({
            "success": True,
            "report": {
                "period": {
                    "start_date": start_date,
                    "end_date": end_date
                },
                "summary": {
                    "total_orders": total_orders,
                    "total_revenue": round(total_revenue, 2),
                    "average_order_value": round(avg_order_value, 2)
                },
                "payment_methods": {
                    "pix": {
                        "count": len(pix_orders),
                        "revenue": round(sum(o.total for o in pix_orders), 2)
                    },
                    "credit_card": {
                        "count": len(card_orders),
                        "revenue": round(sum(o.total for o in card_orders), 2)
                    }
                },
                "status": {
                    "approved": len(approved_orders),
                    "pending": len(pending_orders)
                },
                "popular_items": [
                    {
                        "name": item[0],
                        "quantity_sold": item[1]['quantity'],
                        "revenue": round(item[1]['revenue'], 2)
                    }
                    for item in popular_items
                ]
            }
        })
        
    except Exception as e:
        app.logger.error(f"Error generating sales report: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "success": True,
        "message": "One Pot Restaurant API is running",
        "timestamp": datetime.utcnow().isoformat()
    })
