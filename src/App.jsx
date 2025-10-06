import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { MapPin, Clock, Phone, Star, ChefHat, Utensils, Search, Menu, X, ShoppingCart, Plus, Minus, Trash2, CreditCard, QrCode, Loader2 } from 'lucide-react'
import './App.css'
const API_BASE_URL = 'https://qjh9iec7q3k7.manus.space'

function App() {
  const [activeSection, setActiveSection] = useState('home')
  const [searchTerm, setSearchTerm] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [filteredItems, setFilteredItems] = useState({})
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentResult, setPaymentResult] = useState(null)
  const [pixData, setPixData] = useState(null)
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: 'São Paulo',
    state: 'SP',
    cep: '',
    observations: ''
  })

  // Configuração do Mercado Pago
  const [mp, setMp] = useState(null)
  const [bricksBuilder, setBricksBuilder] = useState(null)
  const [cardPaymentBrickController, setCardPaymentBrickController] = useState(null)

  useEffect(() => {
    // Inicializar MercadoPago.js
    const script = document.createElement('script')
    script.src = 'https://sdk.mercadopago.com/js/v2'
    script.onload = () => {
      console.log('MercadoPago SDK loaded')
      const mercadoPago = new window.MercadoPago('TEST-ae034fa4-581f-4e04-a922-4fcf697872f4')
      console.log('MercadoPago instance created:', mercadoPago)
      setMp(mercadoPago)
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // Inicializar Bricks quando mp estiver disponível
  useEffect(() => {
    if (mp) {
      initializeBricks()
    }
  }, [mp])

  const menuItems = {
    arrozes: [
      { id: 1, name: 'Arroz Biro Biro', price: 39.90, description: 'Arroz temperado especial da casa' },
      { id: 2, name: 'Frango Integral', price: 42.90, description: 'Arroz integral, frango grelhado, cenoura ralada e brócolis' },
      { id: 3, name: 'Baião de Dois', price: 47.90, description: 'Feijão fradinho, arroz branco, linguiça, cebola, carne seca, coentro, queijo coalho, pimenta biquinho' },
      { id: 4, name: 'Baião de Dois Veggie', price: 41.90, description: 'Versão vegetariana do nosso clássico baião', badge: 'Vegetariano' },
      { id: 5, name: 'Galinhada', price: 39.90, description: 'Arroz com frango desfiado e temperos especiais' },
      { id: 6, name: 'Carreteiro', price: 40.90, description: 'Arroz com carne seca e temperos tradicionais' }
    ],
    massas: [
      { id: 7, name: 'Massa Frango ao Bechamel', price: 45.90, description: 'Macarrão com molho bechamel, frango e espinafre (450g)' },
      { id: 8, name: 'Massa com Ragu de Linguiça', price: 42.90, description: 'Massa com delicioso ragu de linguiça e queijo parmesão' },
      { id: 9, name: 'Massa Macarrão Bolonhesa', price: 45.90, description: 'Macarrão com molho bolonhesa tradicional' },
      { id: 10, name: 'Massa Camarão al Limone', price: 54.90, description: 'Massa com camarão refogado em azeite, alho poró, cebola e abobrinha' },
      { id: 11, name: 'Nhoque Bolonhesa', price: 46.90, description: 'Nhoque caseiro com molho de tomate artesanal e carne moída' },
      { id: 12, name: 'Panquecas', price: 54.90, description: 'Panquecas com molho artesanal de tomate (450g, serve 2 pessoas)' }
    ],
    risotos: [
      { id: 13, name: 'Risoto Legumes', price: 45.90, description: 'Risoto cremoso com mix de legumes frescos', badge: 'Vegetariano' },
      { id: 14, name: 'Risoto Linguiça', price: 47.90, description: 'Risoto com linguiça artesanal' },
      { id: 15, name: 'Risoto Carne Seca', price: 50.90, description: 'Risoto com carne seca desfiada' },
      { id: 16, name: 'Risoto Camarão al Limone', price: 56.90, description: 'Risoto com camarão salteado no azeite e finalizado com limão' }
    ],
    strogonoff: [
      { id: 17, name: 'Strogonoff Frango', price: 46.90, description: 'Strogonoff tradicional de frango com arroz e batata palha' },
      { id: 18, name: 'Strogonoff Camarão', price: 54.90, description: 'Camarões e cogumelos com molho cremoso, arroz branco' }
    ],
    yakissoba: [
      { id: 19, name: 'Yakissoba Vegetariano', price: 45.90, description: 'Yakissoba com mix de vegetais frescos', badge: 'Vegetariano' },
      { id: 20, name: 'Yakissoba de Frango', price: 49.90, description: 'Yakissoba tradicional com frango' },
      { id: 21, name: 'Yakissoba de Camarão', price: 56.90, description: 'Yakissoba com camarão, brócolis, couve-flor, cenoura e acelga' }
    ]
  }

  // Filter menu items based on search term
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredItems(menuItems)
    } else {
      const filtered = {}
      Object.keys(menuItems).forEach(category => {
        const filteredCategoryItems = menuItems[category].filter(item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        if (filteredCategoryItems.length > 0) {
          filtered[category] = filteredCategoryItems
        }
      })
      setFilteredItems(filtered)
    }
  }, [searchTerm])

  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      } else {
        return [...prevCart, { ...item, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId)
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      )
    }
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const calculateDeliveryFee = (cep) => {
    if (!cep || cep.length < 8) return 0
    const firstDigit = parseInt(cep.charAt(0))
    if (firstDigit <= 2) return 5.90
    if (firstDigit <= 5) return 8.90
    return 12.90
  }

  const handleInputChange = (field, value) => {
    setCustomerData(prev => ({ ...prev, [field]: value }))
  }

  const initializeBricks = async () => {
    if (!mp) {
      console.log('MP not available for Bricks initialization')
      return
    }

    try {
      console.log('Initializing Bricks with MP:', mp)
      const builder = mp.bricks()
      console.log('Bricks builder created:', builder)
      setBricksBuilder(builder)
    } catch (error) {
      console.error('Error initializing Bricks:', error)
    }
  }

  const renderCardPaymentBrick = async () => {
    if (!bricksBuilder) {
      console.log('BricksBuilder not available for rendering')
      return
    }

    try {
      console.log('Starting Card Payment Brick rendering...')
      
      // Destroy existing brick if it exists
      if (cardPaymentBrickController) {
        console.log('Destroying existing brick controller')
        cardPaymentBrickController.unmount()
      }

      // Check if container exists
      const container = document.getElementById('cardPaymentBrick_container')
      if (!container) {
        console.error('Container cardPaymentBrick_container not found')
        return
      }
      console.log('Container found:', container)

      const totalAmount = getCartTotal() + calculateDeliveryFee(customerData.cep)
      console.log('Total amount for brick:', totalAmount)

      const settings = {
        initialization: {
          amount: totalAmount,
        },
        callbacks: {
          onReady: () => {
            console.log('Card Payment Brick ready')
          },
          onSubmit: (formData) => {
            console.log('Card Payment Brick submitted with data:', formData)
            return new Promise((resolve, reject) => {
              handleCardPaymentBrick(formData, resolve, reject)
            })
          },
          onError: (error) => {
            console.error('Card Payment Brick error:', error)
          },
        },
      }

      console.log('Creating brick with settings:', settings)
      const controller = await bricksBuilder.create(
        'cardPayment',
        'cardPaymentBrick_container',
        settings,
      )
      
      console.log('Brick controller created:', controller)
      setCardPaymentBrickController(controller)
    } catch (error) {
      console.error('Error rendering Card Payment Brick:', error)
    }
  }

  const handleCardPaymentBrick = async (formData, resolve, reject) => {
    setIsProcessingPayment(true)

    try {
      const paymentData = {
        ...formData,
        customer_data: customerData,
        items: cart,
        subtotal: getCartTotal(),
        delivery_fee: calculateDeliveryFee(customerData.cep)
      }

      const response = await fetch(`${API_BASE_URL}/process_card_payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      })

      const result = await response.json()

      if (result.success) {
        setPaymentResult({
          success: true,
          orderId: result.order_id,
          paymentId: result.payment_id,
          status: result.status,
          total: result.total
        })
        setCart([])
        resolve()
      } else {
        setPaymentResult({
          success: false,
          error: result.error || 'Erro ao processar pagamento'
        })
        reject()
      }
    } catch (error) {
      setPaymentResult({
        success: false,
        error: 'Erro de conexão com o servidor'
      })
      reject()
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handlePixPayment = async () => {
    setIsProcessingPayment(true)

    try {
      const paymentData = {
        customer_data: customerData,
        items: cart,
        subtotal: getCartTotal()
      };
      const response = await fetch(`${API_BASE_URL}/api/generate_pix_payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      })

      const result = await response.json()

      if (result.success) {
        setPixData({
          orderId: result.order_id,
          paymentId: result.payment_id,
          pixCode: result.pix_code,
          qrCodeBase64: result.pix_qr_base64,
          total: result.total,
          expirationDate: result.expiration_date
        })
        setCart([])
      } else {
        setPaymentResult({
          success: false,
          error: result.error || 'Erro ao gerar PIX'
        })
      }
    } catch (error) {
      setPaymentResult({
        success: false,
        error: 'Erro de conexão com o servidor'
      })
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handleOrderSubmit = () => {
    if (!customerData.name || !customerData.phone || !customerData.address || !customerData.cep) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }
    
    if (cart.length === 0) {
      alert('Seu carrinho está vazio.')
      return
    }

    if (!paymentMethod) {
      alert('Por favor, selecione uma forma de pagamento.')
      return
    }

    if (paymentMethod === 'pix') {
      handlePixPayment()
    } else if (paymentMethod === 'credit_card') {
      // Card Payment Brick handles submission automatically
      console.log('Card payment will be handled by the Brick')
    }
  }

  const formatWhatsAppMessage = () => {
    const deliveryFee = calculateDeliveryFee(customerData.cep)
    const subtotal = getCartTotal()
    const total = subtotal + deliveryFee

    let message = `🍽️ *PEDIDO - ONE POT PAULISTA*\n\n`
    message += `👤 *Cliente:* ${customerData.name}\n`
    message += `📱 *Telefone:* ${customerData.phone}\n`
    message += `📧 *Email:* ${customerData.email}\n\n`
    
    message += `📍 *Endereço de Entrega:*\n`
    message += `${customerData.address}, ${customerData.number}\n`
    if (customerData.complement) message += `${customerData.complement}\n`
    message += `${customerData.neighborhood} - ${customerData.city}/${customerData.state}\n`
    message += `CEP: ${customerData.cep}\n\n`
    
    message += `🛒 *Itens do Pedido:*\n`
    cart.forEach(item => {
      message += `• ${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n`
    })
    
    message += `\n💰 *Resumo Financeiro:*\n`
    message += `Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}\n`
    message += `Taxa de Entrega: R$ ${deliveryFee.toFixed(2).replace('.', ',')}\n`
    message += `*Total: R$ ${total.toFixed(2).replace('.', ',')}*\n\n`
    
    if (customerData.observations) {
      message += `\n📝 *Observações:* ${customerData.observations}\n`
    }
    
    return encodeURIComponent(message)
  }

  const renderCart = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Carrinho</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowCart(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Seu carrinho está vazio</p>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{item.name}</h3>
                      <p className="text-orange-600 font-bold">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold">R$ {getCartTotal().toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  onClick={() => {
                    setShowCart(false)
                    setShowCheckout(true)
                  }}
                >
                  Finalizar Pedido
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowCart(false)}
                >
                  Continuar Comprando
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )

  const renderCheckout = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Finalizar Pedido</h2>
            <Button variant="ghost" size="sm" onClick={() => {
              setShowCheckout(false)
              setPaymentMethod('')
              setPaymentResult(null)
              setPixData(null)
            }}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {paymentResult && (
            <div className={`mb-6 p-4 rounded-lg ${paymentResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              {paymentResult.success ? (
                <div className="text-green-800">
                  <h3 className="font-bold mb-2">✅ Pagamento Processado!</h3>
                  <p>Pedido #{paymentResult.orderId}</p>
                  <p>Status: {paymentResult.status}</p>
                  <p>Total: R$ {paymentResult.total?.toFixed(2).replace('.', ',')}</p>
                </div>
              ) : (
                <div className="text-red-800">
                  <h3 className="font-bold mb-2">❌ Erro no Pagamento</h3>
                  <p>{paymentResult.error}</p>
                </div>
              )}
            </div>
          )}

          {pixData && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-bold mb-4 text-blue-800">📱 Pagamento PIX Gerado</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="mb-2"><strong>Pedido:</strong> #{pixData.orderId}</p>
                  <p className="mb-2"><strong>Total:</strong> R$ {pixData.total?.toFixed(2).replace('.', ',')}</p>
                  <p className="mb-4 text-sm text-gray-600">Escaneie o QR Code ou copie o código PIX</p>
                  
                  {pixData.pixCode && (
                    <div className="mb-4">
                      <Label>Código PIX (Copia e Cola):</Label>
                      <div className="flex gap-2 mt-1">
                        <Input 
                          value={pixData.pixCode} 
                          readOnly 
                          className="text-xs"
                        />
                        <Button 
                          size="sm" 
                          onClick={() => navigator.clipboard.writeText(pixData.pixCode)}
                        >
                          Copiar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                {pixData.qrCodeBase64 && (
                  <div className="flex justify-center">
                    <img 
                      src={`data:image/png;base64,${pixData.qrCodeBase64}`} 
                      alt="QR Code PIX" 
                      className="max-w-48 max-h-48"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Dados do Cliente */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dados do Cliente</h3>
              
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={customerData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={customerData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
              
              <h3 className="text-lg font-semibold pt-4">Endereço de Entrega</h3>
              
              <div>
                <Label htmlFor="cep">CEP *</Label>
                <Input
                  id="cep"
                  value={customerData.cep}
                  onChange={(e) => handleInputChange('cep', e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                />
              </div>
              
              <div>
                <Label htmlFor="address">Endereço *</Label>
                <Input
                  id="address"
                  value={customerData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Rua, Avenida..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="number">Número *</Label>
                  <Input
                    id="number"
                    value={customerData.number}
                    onChange={(e) => handleInputChange('number', e.target.value)}
                    placeholder="123"
                  />
                </div>
                <div>
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={customerData.complement}
                    onChange={(e) => handleInputChange('complement', e.target.value)}
                    placeholder="Apto, Bloco..."
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  value={customerData.neighborhood}
                  onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                  placeholder="Nome do bairro"
                />
              </div>
              
              <div>
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  value={customerData.observations}
                  onChange={(e) => handleInputChange('observations', e.target.value)}
                  placeholder="Observações sobre o pedido..."
                  rows={3}
                />
              </div>

              {/* Forma de Pagamento */}
              <div>
                <Label>Forma de Pagamento *</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    variant={paymentMethod === 'credit_card' ? 'default' : 'outline'}
                    onClick={() => {
                      setPaymentMethod('credit_card')
                      if (!bricksBuilder) {
                        initializeBricks().then(() => {
                          setTimeout(renderCardPaymentBrick, 100)
                        })
                      } else {
                        setTimeout(renderCardPaymentBrick, 100)
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Cartão
                  </Button>
                  <Button
                    variant={paymentMethod === 'pix' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('pix')}
                    className="flex items-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    PIX
                  </Button>
                </div>
              </div>

              {/* Card Payment Brick */}
              {paymentMethod === 'credit_card' && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-semibold">Dados do Cartão</h4>
                  <div id="cardPaymentBrick_container"></div>
                </div>
              )}
            </div>
            
            {/* Resumo do Pedido */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Resumo do Pedido</h3>
              
              <div className="border rounded-lg p-4 space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.quantity}x R$ {item.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <p className="font-bold">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                  </div>
                ))}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {getCartTotal().toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa de Entrega:</span>
                    <span>R$ {calculateDeliveryFee(customerData.cep).toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-orange-600">
                      R$ {(getCartTotal() + calculateDeliveryFee(customerData.cep)).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
              


              
              {paymentMethod === 'pix' && (
                <Button
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  onClick={handleOrderSubmit}
                  disabled={isProcessingPayment || cart.length === 0}
                >
                  {isProcessingPayment ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...</>
                  ) : (
                    "Processar Pagamento"
                  )}
                </Button>
              )}
              {paymentMethod !== 'pix' && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const whatsappMessage = formatWhatsAppMessage()
                    const whatsappUrl = `https://wa.me/5511999999999?text=${whatsappMessage}`
                    window.open(whatsappUrl, 
                    '_blank')
                  }}
                >
                  Ou Enviar via WhatsApp
                </Button>
              )}
              
              <p className="text-xs text-gray-500 text-center">
                Pagamentos processados com segurança pelo Mercado Pago
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderHome = () => (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-600 to-red-600 text-white py-20 px-6 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <ChefHat className="w-16 h-16 animate-bounce" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-6">One Pot - Paulista</h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Sabores autênticos e pratos caseiros preparados com carinho. 
            Descubra nossa variedade de arrozes, massas, risotos e muito mais.
          </p>
          <div className="flex items-center justify-center gap-2 mb-8">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="text-lg font-semibold">4.8</span>
            <span className="opacity-75">• Avaliação dos clientes</span>
          </div>
          <Button 
            size="lg" 
            className="bg-white text-orange-600 hover:bg-gray-100 font-semibold px-8 py-3 transform hover:scale-105 transition-all duration-200"
            onClick={() => setActiveSection('cardapio')}
          >
            Ver Cardápio
          </Button>
        </div>
      </section>

      {/* Destaques */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Nossos Destaques</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-orange-600" />
                  Baião de Dois
                </CardTitle>
                <CardDescription>Nosso prato mais popular</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Feijão fradinho, arroz branco, linguiça, carne seca e queijo coalho
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-orange-600">R$ 47,90</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveSection('cardapio')}
                    className="hover:bg-orange-50"
                  >
                    Ver mais
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-orange-600" />
                  Risoto Camarão
                </CardTitle>
                <CardDescription>Especialidade da casa</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Risoto cremoso com camarão salteado e toque de limão
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-orange-600">R$ 56,90</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveSection('cardapio')}
                    className="hover:bg-orange-50"
                  >
                    Ver mais
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-orange-600" />
                  Yakissoba Vegetariano
                </CardTitle>
                <CardDescription>Opção saudável</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Yakissoba com mix de vegetais frescos e temperos especiais
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-orange-600">R$ 45,90</span>
                  <Badge variant="secondary" className="text-xs">Vegetariano</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )

  const renderMenu = () => (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Nosso Cardápio</h1>
        <p className="text-lg text-gray-600 mb-8">Pratos preparados com ingredientes frescos e muito carinho</p>
        
        {/* Search Bar */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar pratos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
          />
        </div>
      </div>

      {Object.keys(filteredItems).length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nenhum prato encontrado para "{searchTerm}"</p>
        </div>
      ) : (
        Object.entries(filteredItems).map(([category, items]) => (
          <section key={category} className="space-y-6">
            <h2 className="text-2xl font-bold capitalize border-b-2 border-orange-600 pb-2">
              {category.replace('_', ' ')}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item, index) => (
                <Card key={index} className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-orange-600">
                        R$ {item.price.toFixed(2).replace('.', ',')}
                      </span>
                      <Button 
                        size="sm" 
                        className="bg-orange-600 hover:bg-orange-700 transform hover:scale-105 transition-all duration-200"
                        onClick={() => addToCart(item)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )

  const renderAbout = () => (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Sobre Nós</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          O One Pot nasceu da paixão pela culinária caseira e pelo desejo de oferecer 
          pratos saborosos e nutritivos para toda a família.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Nossa História</h2>
          <p className="text-gray-600">
            Localizado na região da Paulista, o One Pot se especializou em pratos únicos 
            que combinam tradição e inovação. Nosso conceito "one pot" representa a 
            filosofia de criar refeições completas e saborosas em uma única preparação.
          </p>
          <p className="text-gray-600">
            Cada prato é cuidadosamente preparado com ingredientes frescos e selecionados, 
            garantindo qualidade e sabor em cada garfada. Nossa equipe trabalha com dedicação 
            para oferecer uma experiência gastronômica única.
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-100 to-red-100 p-8 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Nossos Valores</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <ChefHat className="w-5 h-5 text-orange-600" />
              <span>Qualidade em cada ingrediente</span>
            </li>
            <li className="flex items-center gap-3">
              <Star className="w-5 h-5 text-orange-600" />
              <span>Excelência no atendimento</span>
            </li>
            <li className="flex items-center gap-3">
              <Utensils className="w-5 h-5 text-orange-600" />
              <span>Tradição e inovação</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )

  const renderContact = () => (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Contato</h1>
        <p className="text-lg text-gray-600">Entre em contato conosco ou visite nosso restaurante</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Região da Paulista - Bela Vista<br />
                São Paulo - SP
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Horário de Funcionamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Segunda a Domingo<br />
                09:00 às 22:00
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-orange-600" />
                Telefone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                (11) 9999-9999<br />
                WhatsApp disponível
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
            <div className="text-center text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-2" />
              <p>Mapa do Google Maps</p>
              <p className="text-sm">Região da Paulista - Bela Vista</p>
            </div>
          </div>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Faça seu Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Peça pelo nosso sistema online com pagamento seguro ou pelo iFood.
              </p>
              <div className="space-y-2">
                <Button 
                  className="w-full bg-orange-600 hover:bg-orange-700 transform hover:scale-105 transition-all duration-200"
                  onClick={() => setActiveSection('cardapio')}
                >
                  Pedir Online
                </Button>
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700 transform hover:scale-105 transition-all duration-200"
                  onClick={() => window.open('https://www.ifood.com.br/delivery/sao-paulo-sp/one-pot---paulista-bela-vista/57e5f89f-c600-42ee-9b6e-8a74d9f85540', '_blank')}
                >
                  Pedir pelo iFood
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full hover:bg-green-50 transform hover:scale-105 transition-all duration-200"
                  onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
                >
                  WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChefHat className="w-8 h-8 text-orange-600" />
              <h1 className="text-2xl font-bold text-gray-800">One Pot</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => setActiveSection('home')}
                className={`font-medium transition-colors ${
                  activeSection === 'home' ? 'text-orange-600' : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                Início
              </button>
              <button 
                onClick={() => setActiveSection('cardapio')}
                className={`font-medium transition-colors ${
                  activeSection === 'cardapio' ? 'text-orange-600' : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                Cardápio
              </button>
              <button 
                onClick={() => setActiveSection('sobre')}
                className={`font-medium transition-colors ${
                  activeSection === 'sobre' ? 'text-orange-600' : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                Sobre
              </button>
              <button 
                onClick={() => setActiveSection('contato')}
                className={`font-medium transition-colors ${
                  activeSection === 'contato' ? 'text-orange-600' : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                Contato
              </button>
            </nav>

            {/* Cart and Mobile Menu */}
            <div className="flex items-center gap-4">
              {/* Cart Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCart(true)}
                className="relative"
              >
                <ShoppingCart className="w-4 h-4" />
                {getCartItemCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs">
                    {getCartItemCount()}
                  </Badge>
                )}
              </Button>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>

              {/* Desktop Order Button */}
              <Button 
                className="hidden md:block bg-orange-600 hover:bg-orange-700 transform hover:scale-105 transition-all duration-200"
                onClick={() => setActiveSection('cardapio')}
              >
                Pedir Agora
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t pt-4">
              <div className="flex flex-col space-y-4">
                <button 
                  onClick={() => {
                    setActiveSection('home')
                    setMobileMenuOpen(false)
                  }}
                  className={`text-left font-medium transition-colors ${
                    activeSection === 'home' ? 'text-orange-600' : 'text-gray-600'
                  }`}
                >
                  Início
                </button>
                <button 
                  onClick={() => {
                    setActiveSection('cardapio')
                    setMobileMenuOpen(false)
                  }}
                  className={`text-left font-medium transition-colors ${
                    activeSection === 'cardapio' ? 'text-orange-600' : 'text-gray-600'
                  }`}
                >
                  Cardápio
                </button>
                <button 
                  onClick={() => {
                    setActiveSection('sobre')
                    setMobileMenuOpen(false)
                  }}
                  className={`text-left font-medium transition-colors ${
                    activeSection === 'sobre' ? 'text-orange-600' : 'text-gray-600'
                  }`}
                >
                  Sobre
                </button>
                <button 
                  onClick={() => {
                    setActiveSection('contato')
                    setMobileMenuOpen(false)
                  }}
                  className={`text-left font-medium transition-colors ${
                    activeSection === 'contato' ? 'text-orange-600' : 'text-gray-600'
                  }`}
                >
                  Contato
                </button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeSection === 'home' && renderHome()}
        {activeSection === 'cardapio' && renderMenu()}
        {activeSection === 'sobre' && renderAbout()}
        {activeSection === 'contato' && renderContact()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <ChefHat className="w-6 h-6 text-orange-600" />
                <h3 className="text-xl font-bold">One Pot</h3>
              </div>
              <p className="text-gray-400">
                Sabores autênticos e pratos caseiros preparados com carinho.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <div className="space-y-2 text-gray-400">
                <p>Região da Paulista - Bela Vista</p>
                <p>São Paulo - SP</p>
                <p>(11) 9999-9999</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Horário</h4>
              <div className="space-y-2 text-gray-400">
                <p>Segunda a Domingo</p>
                <p>09:00 às 22:00</p>
                <div className="flex items-center gap-2 mt-4">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-white font-semibold">4.8</span>
                  <span>no iFood</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 One Pot - Paulista. Todos os direitos reservados.</p>
            <p className="text-sm mt-2">Pagamentos processados com segurança pelo Mercado Pago</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showCart && renderCart()}
      {showCheckout && renderCheckout()}
    </div>
  )
}

export default App


