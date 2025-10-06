
from flask import Flask, request, jsonify
from flask_cors import CORS
import mercadopago
import os

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Initialize Mercado Pago SDK
# Replace with your actual access token from environment variables
MP_ACCESS_TOKEN = "TEST-3110328722128258-100514-63e7dc670655b03344e180477a3d5da3-190968069"

mp = mercadopago.SDK(MP_ACCESS_TOKEN)

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

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

