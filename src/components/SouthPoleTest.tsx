import React, { useState, useEffect } from 'react';
import { ShoppingCart, Loader, AlertCircle, CheckCircle, Package } from 'lucide-react';
import { SouthPoleApi } from '../services/southPoleApi';

interface Product {
  sku: string;
  name: string;
  price: number;
  custom_attributes?: Array<{
    attribute_code: string;
    value: string;
  }>;
}

interface Credentials {
  username: string;
  password: string;
}

interface OrderForm {
  certificateName: string;
  firstname: string;
  lastname: string;
  email: string;
  telephone: string;
  street: string;
  city: string;
  postcode: string;
  country_id: string;
  region: string;
}

export default function SouthPoleTest() {
  const [credentials, setCredentials] = useState<Credentials>({
    username: import.meta.env.VITE_SOUTHPOLE_USERNAME || '',
    password: import.meta.env.VITE_SOUTHPOLE_PASSWORD || ''
  });
  
  const [api, setApi] = useState<SouthPoleApi | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  const [orderForm, setOrderForm] = useState<OrderForm>({
    certificateName: '',
    firstname: '',
    lastname: '',
    email: '',
    telephone: '',
    street: '',
    city: '',
    postcode: '',
    country_id: 'US',
    region: 'New York'
  });

  const baseUrl = import.meta.env.VITE_SOUTHPOLE_BASE_URL || 'https://shop-dev.southpole.com/';

  // Initialize API when credentials change
  useEffect(() => {
    if (credentials.username && credentials.password) {
      setApi(new SouthPoleApi({
        baseUrl,
        username: credentials.username,
        password: credentials.password
      }));
    }
  }, [credentials.username, credentials.password, baseUrl]);

  const handleAuthenticate = async () => {
    if (!api) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await api.authenticate();
      setIsAuthenticated(true);
      setSuccess('Successfully authenticated!');
      
      // Load products
      const productList = await api.getProducts();
      setProducts(productList.filter(p => p.name.toLowerCase().includes('carbon') || p.name.toLowerCase().includes('credit')));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!api || !selectedProduct) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Create cart
      await api.createCart();
      
      // Add product to cart
      await api.addToCart(selectedProduct.sku, quantity);
      
      // Set certificate name if provided
      if (orderForm.certificateName) {
        await api.setCertificateName(orderForm.certificateName);
      }
      
      // Set shipping and billing address
      const address = {
        region: orderForm.region,
        region_id: 43, // NY for demo
        country_id: orderForm.country_id,
        street: [orderForm.street],
        postcode: orderForm.postcode,
        city: orderForm.city,
        firstname: orderForm.firstname,
        lastname: orderForm.lastname,
        email: orderForm.email,
        telephone: orderForm.telephone
      };
      
      await api.setShippingInformation(address, address);
      
      // Set payment method (check/money order for testing)
      await api.setPaymentMethod('checkmo');
      
      // Place order
      const orderId = await api.placeOrder();
      setOrderId(orderId);
      setSuccess(`Order placed successfully! Order ID: ${orderId}`);
      
      // Reset form
      setSelectedProduct(null);
      setQuantity(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order placement failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Package className="text-green-500" />
          South Pole Carbon Credits Test
        </h1>

        {/* Credentials Section */}
        {!isAuthenticated && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">API Credentials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter password"
                />
              </div>
            </div>
            <button
              onClick={handleAuthenticate}
              disabled={loading || !credentials.username || !credentials.password}
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <Loader className="animate-spin" size={20} /> : null}
              Authenticate & Load Products
            </button>
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="text-red-500" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="bg-green-900/20 border border-green-500 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="text-green-500" />
            <span>{success}</span>
          </div>
        )}

        {/* Products Section */}
        {isAuthenticated && products.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Available Carbon Credits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((product) => (
                <div
                  key={product.sku}
                  onClick={() => setSelectedProduct(product)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedProduct?.sku === product.sku
                      ? 'bg-green-900/30 border-2 border-green-500'
                      : 'bg-gray-700 hover:bg-gray-600 border-2 border-transparent'
                  }`}
                >
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-gray-400">SKU: {product.sku}</p>
                  <p className="text-2xl font-bold text-green-400 mt-2">${product.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Form */}
        {isAuthenticated && selectedProduct && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Place Order</h2>
            
            <div className="mb-6 p-4 bg-gray-700 rounded-lg">
              <h3 className="font-semibold">{selectedProduct.name}</h3>
              <p className="text-gray-400">Price per credit: ${selectedProduct.price}</p>
              <div className="mt-3 flex items-center gap-4">
                <label>Quantity:</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-1 bg-gray-600 rounded"
                />
                <span className="text-green-400 font-bold">
                  Total: ${(selectedProduct.price * quantity).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Certificate Name (Optional)</label>
                <input
                  type="text"
                  value={orderForm.certificateName}
                  onChange={(e) => setOrderForm({...orderForm, certificateName: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                  placeholder="Company or recipient name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  value={orderForm.firstname}
                  onChange={(e) => setOrderForm({...orderForm, firstname: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  value={orderForm.lastname}
                  onChange={(e) => setOrderForm({...orderForm, lastname: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={orderForm.email}
                  onChange={(e) => setOrderForm({...orderForm, email: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={orderForm.telephone}
                  onChange={(e) => setOrderForm({...orderForm, telephone: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Street Address</label>
                <input
                  type="text"
                  value={orderForm.street}
                  onChange={(e) => setOrderForm({...orderForm, street: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  value={orderForm.city}
                  onChange={(e) => setOrderForm({...orderForm, city: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Postal Code</label>
                <input
                  type="text"
                  value={orderForm.postcode}
                  onChange={(e) => setOrderForm({...orderForm, postcode: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                  required
                />
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading || !orderForm.firstname || !orderForm.lastname || !orderForm.email}
              className="w-full bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader className="animate-spin" size={20} /> : <ShoppingCart size={20} />}
              Place Order
            </button>
          </div>
        )}

        {/* Order Success */}
        {orderId && (
          <div className="mt-8 bg-green-900/20 border border-green-500 rounded-lg p-6 text-center">
            <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-semibold mb-2">Order Placed Successfully!</h3>
            <p className="text-gray-300">Order ID: <span className="font-mono">{orderId}</span></p>
            <p className="text-sm text-gray-400 mt-2">
              Your carbon credits have been purchased and will be processed shortly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}