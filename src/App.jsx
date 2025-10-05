import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { MapPin, Clock, Phone, Star, ChefHat, Utensils, Search, Menu, X } from 'lucide-react'
import './App.css'

function App() {
  const [activeSection, setActiveSection] = useState('home')
  const [searchTerm, setSearchTerm] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [filteredItems, setFilteredItems] = useState({})

  const menuItems = {
    arrozes: [
      { name: 'Arroz Biro Biro', price: 39.90, description: 'Arroz temperado especial da casa' },
      { name: 'Frango Integral', price: 42.90, description: 'Arroz integral, frango grelhado, cenoura ralada e brócolis' },
      { name: 'Baião de Dois', price: 47.90, description: 'Feijão fradinho, arroz branco, linguiça, cebola, carne seca, coentro, queijo coalho, pimenta biquinho' },
      { name: 'Baião de Dois Veggie', price: 41.90, description: 'Versão vegetariana do nosso clássico baião', badge: 'Vegetariano' },
      { name: 'Galinhada', price: 39.90, description: 'Arroz com frango desfiado e temperos especiais' },
      { name: 'Carreteiro', price: 40.90, description: 'Arroz com carne seca e temperos tradicionais' }
    ],
    massas: [
      { name: 'Massa Frango ao Bechamel', price: 45.90, description: 'Macarrão com molho bechamel, frango e espinafre (450g)' },
      { name: 'Massa com Ragu de Linguiça', price: 42.90, description: 'Massa com delicioso ragu de linguiça e queijo parmesão' },
      { name: 'Massa Macarrão Bolonhesa', price: 45.90, description: 'Macarrão com molho bolonhesa tradicional' },
      { name: 'Massa Camarão al Limone', price: 54.90, description: 'Massa com camarão refogado em azeite, alho poró, cebola e abobrinha' },
      { name: 'Nhoque Bolonhesa', price: 46.90, description: 'Nhoque caseiro com molho de tomate artesanal e carne moída' },
      { name: 'Panquecas', price: 54.90, description: 'Panquecas com molho artesanal de tomate (450g, serve 2 pessoas)' }
    ],
    risotos: [
      { name: 'Risoto Legumes', price: 45.90, description: 'Risoto cremoso com mix de legumes frescos', badge: 'Vegetariano' },
      { name: 'Risoto Linguiça', price: 47.90, description: 'Risoto com linguiça artesanal' },
      { name: 'Risoto Carne Seca', price: 50.90, description: 'Risoto com carne seca desfiada' },
      { name: 'Risoto Camarão al Limone', price: 56.90, description: 'Risoto com camarão salteado no azeite e finalizado com limão' }
    ],
    strogonoff: [
      { name: 'Strogonoff Frango', price: 46.90, description: 'Strogonoff tradicional de frango com arroz e batata palha' },
      { name: 'Strogonoff Camarão', price: 54.90, description: 'Camarões e cogumelos com molho cremoso, arroz branco' }
    ],
    yakissoba: [
      { name: 'Yakissoba Vegetariano', price: 45.90, description: 'Yakissoba com mix de vegetais frescos', badge: 'Vegetariano' },
      { name: 'Yakissoba de Frango', price: 49.90, description: 'Yakissoba tradicional com frango' },
      { name: 'Yakissoba de Camarão', price: 56.90, description: 'Yakissoba com camarão, brócolis, couve-flor, cenoura e acelga' }
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

  const handleOrderClick = (itemName) => {
    alert(`Redirecionando para pedido: ${itemName}`)
  }

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
                        onClick={() => handleOrderClick(item.name)}
                      >
                        Pedir
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
                Peça pelo iFood ou entre em contato diretamente conosco.
              </p>
              <div className="space-y-2">
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
      <header className="bg-white shadow-sm sticky top-0 z-50">
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

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <Button 
                className="bg-orange-600 hover:bg-orange-700"
                size="sm"
                onClick={() => window.open('https://www.ifood.com.br/delivery/sao-paulo-sp/one-pot---paulista-bela-vista/57e5f89f-c600-42ee-9b6e-8a74d9f85540', '_blank')}
              >
                Pedir
              </Button>
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
              onClick={() => window.open('https://www.ifood.com.br/delivery/sao-paulo-sp/one-pot---paulista-bela-vista/57e5f89f-c600-42ee-9b6e-8a74d9f85540', '_blank')}
            >
              Pedir Agora
            </Button>
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
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
