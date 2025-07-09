import axios from 'axios';

interface SouthPoleConfig {
  baseUrl: string;
  username: string;
  password: string;
}

interface Product {
  sku: string;
  name: string;
  price: number;
  custom_attributes?: Array<{
    attribute_code: string;
    value: string;
  }>;
  extension_attributes?: {
    project_name?: string;
    vintage_year?: string;
    certification?: string;
  };
}

interface CartItem {
  sku: string;
  qty: number;
  quote_id: string;
}

interface Address {
  region: string;
  region_id: number;
  country_id: string;
  street: string[];
  postcode: string;
  city: string;
  firstname: string;
  lastname: string;
  email: string;
  telephone: string;
}

export class SouthPoleApi {
  private config: SouthPoleConfig;
  private token: string | null = null;
  private cartId: string | null = null;

  constructor(config: SouthPoleConfig) {
    this.config = config;
  }

  // Authenticate and get token
  async authenticate(): Promise<string> {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}rest/V1/integration/customer/token`,
        {
          username: this.config.username,
          password: this.config.password
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      this.token = response.data.replace(/"/g, ''); // Remove quotes from token
      return this.token;
    } catch (error) {
      console.error('Authentication failed:', error);
      throw new Error('Failed to authenticate with South Pole API');
    }
  }

  // Get available products
  async getProducts(searchCriteria?: any): Promise<Product[]> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const params = searchCriteria || {
        'searchCriteria[filterGroups][0][filters][0][field]': 'type_id',
        'searchCriteria[filterGroups][0][filters][0][value]': 'simple',
        'searchCriteria[pageSize]': 20
      };

      const response = await axios.get(
        `${this.config.baseUrl}rest/V1/products`,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          },
          params
        }
      );

      return response.data.items || [];
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  // Get product details
  async getProductDetails(sku: string): Promise<Product> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await axios.get(
        `${this.config.baseUrl}rest/V1/products/${sku}`,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to fetch product details:', error);
      throw new Error('Failed to fetch product details');
    }
  }

  // Create cart
  async createCart(): Promise<string> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await axios.post(
        `${this.config.baseUrl}rest/V1/carts/mine`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      this.cartId = response.data;
      return this.cartId;
    } catch (error) {
      console.error('Failed to create cart:', error);
      throw new Error('Failed to create cart');
    }
  }

  // Add item to cart
  async addToCart(sku: string, quantity: number): Promise<any> {
    if (!this.token) {
      await this.authenticate();
    }
    if (!this.cartId) {
      await this.createCart();
    }

    try {
      const response = await axios.post(
        `${this.config.baseUrl}rest/V1/carts/mine/items`,
        {
          cartItem: {
            sku: sku,
            qty: quantity,
            quote_id: this.cartId
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw new Error('Failed to add item to cart');
    }
  }

  // Get cart totals
  async getCartTotals(): Promise<any> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await axios.get(
        `${this.config.baseUrl}rest/V1/carts/mine/totals`,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to get cart totals:', error);
      throw new Error('Failed to get cart totals');
    }
  }

  // Set shipping information
  async setShippingInformation(shippingAddress: Address, billingAddress: Address): Promise<any> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await axios.post(
        `${this.config.baseUrl}rest/V1/carts/mine/shipping-information`,
        {
          addressInformation: {
            shipping_address: shippingAddress,
            billing_address: billingAddress,
            shipping_carrier_code: 'flatrate',
            shipping_method_code: 'flatrate'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to set shipping information:', error);
      throw new Error('Failed to set shipping information');
    }
  }

  // Set payment method
  async setPaymentMethod(paymentMethod: string = 'checkmo'): Promise<any> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await axios.post(
        `${this.config.baseUrl}rest/V1/carts/mine/payment-information`,
        {
          paymentMethod: {
            method: paymentMethod
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to set payment method:', error);
      throw new Error('Failed to set payment method');
    }
  }

  // Place order
  async placeOrder(): Promise<string> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await axios.put(
        `${this.config.baseUrl}rest/V1/carts/mine/order`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data; // Returns order ID
    } catch (error) {
      console.error('Failed to place order:', error);
      throw new Error('Failed to place order');
    }
  }

  // Set certificate name
  async setCertificateName(name: string): Promise<any> {
    if (!this.token) {
      await this.authenticate();
    }
    if (!this.cartId) {
      throw new Error('No active cart');
    }

    try {
      const response = await axios.put(
        `${this.config.baseUrl}rest/V1/certificate/savecertificatedata`,
        {
          certificate_name: name,
          cart_id: this.cartId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to set certificate name:', error);
      throw new Error('Failed to set certificate name');
    }
  }
}