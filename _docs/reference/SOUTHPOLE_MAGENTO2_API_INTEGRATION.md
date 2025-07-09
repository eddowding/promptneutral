# South Pole Magento2 API Integration Reference

## Introduction

This document provides comprehensive guidance for integrating with South Pole's Magento2-based API for carbon credit marketplace operations. It covers authentication methods, available endpoints, request/response formats, and implementation best practices for developers working with the South Pole carbon credit ecommerce platform.

## See also

- `_docs-marketplaces/South Pole Shops API Collection.json` - Complete Postman collection with all API endpoints
- `_docs-marketplaces/South Pole Shops Test Environment.postman_environment.json` - Environment configuration for testing
- https://guide.southpole.com/s/api/ - Official South Pole API documentation
- https://shop-dev.southpole.com/PlaceOrderLogin.html - Interactive order placement testing
- https://developer.adobe.com/commerce/webapi/rest/ - Magento2 REST API documentation

## Principles and Key Decisions

- **Authentication**: Uses both OAuth 1.0a and token-based authentication depending on the endpoint
- **Environment**: Development environment at `https://shop-dev.southpole.com/`
- **API Structure**: Standard Magento2 REST API structure with `/rest/V1/` prefix
- **Store View**: Main EUR store view (`/rest/main_EUR/V1/`) for European operations
- **Security**: All API calls require proper authentication tokens or OAuth signatures

## Authentication Methods

### 1. Token-Based Authentication (Customer Operations)

Most customer-facing operations use JWT token authentication:

```bash
POST {{base_url}}rest/V1/integration/customer/token
Content-Type: application/json

{
  "username": "customer@email.com",
  "password": "customer_password"
}
```

Response returns a JWT token valid for 1 hour:
```json
"eyJraWQiOiIxIiwiYWxnIjoiSFMyNTYifQ.eyJ1aWQiOjQ3OTIsInV0eXBpZCI6MywiaWF0IjoxNzI2MDUyNjQ0LCJleHAiOjE3MjYwNTYyNDR9.XL188pgBSFfv-f6__zWyk-3-snLcN85uLhjdBnhCLnc"
```

Use the token in subsequent requests:
```bash
Authorization: Bearer {{token}}
```

### 2. OAuth 1.0a Authentication (Admin Operations)

Admin and inventory operations require OAuth 1.0a with HMAC-SHA256:

```
Consumer Key: m61vecjfn02iouffq4kleccejayycdll
Consumer Secret: uitl8wzk08vhvr7y9kygszm5wvr819r1
Access Token: hdrz2lg9hkdbolq2avu108ebitaxsfkf
Token Secret: 8rajklnq4jn2d9ekrna1wb1g44yafym3
```

## Core API Endpoints

### Customer Authentication
- `POST /rest/V1/integration/customer/token` - Obtain customer authentication token

### Cart Management
- `POST /rest/V1/carts/mine` - Create customer cart
- `POST /rest/V1/carts` - Create guest cart
- `GET /rest/V1/carts/mine` - Get cart details
- `POST /rest/V1/carts/mine/items` - Add items to cart
- `DELETE /rest/V1/carts/mine/items/:itemId` - Remove cart items
- `GET /rest/V1/carts/mine/totals` - Get cart totals

### Product Operations
- `GET /rest/V1/products/:sku` - Get product details
- `GET /rest/V1/products` - Get product collection with filters
- `GET /rest/V1/stockItems/:sku` - Get carbon credit availability

### Checkout Process
- `POST /rest/V1/carts/mine/shipping-information` - Set shipping address and method
- `GET /rest/V1/carts/mine/payment-information` - Get available payment methods
- `POST /rest/V1/carts/mine/payment-information` - Set payment method
- `PUT /rest/V1/carts/mine/order` - Place order

### Order Management
- `GET /rest/V1/orders` - Get customer orders
- `GET /rest/V1/orders/:orderId` - Get order details
- `POST /rest/V1/orders/:orderId/cancel` - Cancel order

### Certificate Management
- `PUT /rest/V1/certificate/savecertificatedata` - Set certificate recipient name

### Geographic Data
- `GET /rest/V1/directory/countries` - Get available countries
- `GET /rest/V1/directory/countries/:countryId` - Get country details

## Complete Order Placement Workflow

### 1. Customer Login
```bash
POST {{base_url}}rest/main_EUR/V1/integration/customer/token
Content-Type: application/json

{
  "username": "customer@email.com",
  "password": "password"
}
```

### 2. Create Cart
```bash
POST {{base_url}}rest/main_EUR/V1/carts/mine
Authorization: Bearer {{customer_token}}
```

### 3. Add Carbon Credits to Cart
```bash
POST {{base_url}}rest/main_EUR/V1/carts/mine/items
Authorization: Bearer {{customer_token}}
Content-Type: application/json

{
  "cartItem": {
    "sku": "303431",
    "qty": 10,
    "quote_id": "{{cart_id}}"
  }
}
```

### 4. Set Shipping Information
```bash
POST {{base_url}}rest/main_EUR/V1/carts/mine/shipping-information
Authorization: Bearer {{customer_token}}
Content-Type: application/json

{
  "addressInformation": {
    "shipping_address": {
      "region": "New York",
      "region_id": 43,
      "country_id": "US",
      "street": ["123 Main St"],
      "postcode": "10001",
      "city": "New York",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john.doe@example.com",
      "telephone": "555-0123"
    },
    "billing_address": {
      // Same structure as shipping_address
    },
    "shipping_carrier_code": "flatrate",
    "shipping_method_code": "flatrate"
  }
}
```

### 5. Set Payment Method
```bash
POST {{base_url}}rest/main_EUR/V1/carts/mine/payment-information
Authorization: Bearer {{customer_token}}
Content-Type: application/json

{
  "paymentMethod": {
    "method": "stripe_payments"
  },
  "billing_address": {
    // Address structure
  }
}
```

### 6. Place Order
```bash
PUT {{base_url}}rest/main_EUR/V1/carts/mine/order
Authorization: Bearer {{customer_token}}
```

## Carbon Credit Specific Features

### Product SKU Format
Carbon credits use SKUs in format: `XXXXXX-YYYY` where:
- `XXXXXX` is the project identifier
- `YYYY` is the vintage year

Example: `303431-2020` for 2020 vintage credits from project 303431

### Certificate Customization
Set certificate recipient name before order placement:
```bash
PUT {{base_url}}rest/V1/certificate/savecertificatedata
Authorization: Bearer {{customer_token}}
Content-Type: application/json

{
  "certificate_name": "Company Name or Recipient",
  "cart_id": "{{cart_id}}"
}
```

### Stock Availability
Check carbon credit availability:
```bash
GET {{base_url}}rest/V1/stockItems/303693-2020
```

## Guest Checkout Flow

For users without accounts:

1. Create guest cart: `POST /rest/V1/guest-carts`
2. Add items: `POST /rest/V1/guest-carts/:cartId/items`
3. Set shipping: `POST /rest/V1/guest-carts/:cartId/shipping-information`
4. Get payment methods: `GET /rest/V1/guest-carts/:cartId/payment-methods`
5. Place order: `PUT /rest/V1/guest-carts/:cartId/order`

## Error Handling

Common error responses:
- `401 Unauthorized` - Invalid or expired token
- `404 Not Found` - Resource doesn't exist
- `400 Bad Request` - Invalid request format
- `500 Internal Server Error` - Server-side issue

Example error response:
```json
{
  "message": "The consumer isn't authorized to access %resources.",
  "parameters": {
    "resources": "Magento_Sales::sales"
  }
}
```

## Best Practices

1. **Token Management**: 
   - Store tokens securely
   - Implement token refresh logic (tokens expire after 1 hour)
   - Don't hardcode credentials

2. **Error Handling**:
   - Implement retry logic for transient failures
   - Log all API errors for debugging
   - Handle token expiration gracefully

3. **Performance**:
   - Cache product data when possible
   - Batch operations where supported
   - Use pagination for large result sets

4. **Security**:
   - Always use HTTPS
   - Validate SSL certificates
   - Never expose OAuth secrets in client-side code

## Testing

Use the provided Postman collection for testing:
1. Import `South Pole Shops API Collection.json`
2. Import `South Pole Shops Test Environment.postman_environment.json`
3. Update environment variables with your credentials
4. Test endpoints in the following order:
   - Login
   - Create Cart
   - Add Products
   - Complete Checkout

## Limitations and Considerations

1. **Rate Limiting**: API rate limits may apply (specific limits not documented)
2. **Vintage Years**: Ensure carbon credit vintage years are valid and available
3. **Payment Processing**: Stripe 3D Secure verification may be required for certain transactions
4. **Geographic Restrictions**: Some operations may be limited to specific regions

## Troubleshooting

### Common Issues:

1. **Authentication Failures**:
   - Verify token hasn't expired
   - Check OAuth signature generation
   - Ensure correct environment URL

2. **Cart Operations**:
   - Cart must be active and belong to authenticated user
   - Product SKUs must be exact matches
   - Quantities must be available in stock

3. **Order Placement**:
   - All required fields must be populated
   - Shipping and billing addresses must be valid
   - Payment method must be configured

## Future Enhancements

Based on current implementation, potential areas for enhancement:
- WebSocket support for real-time inventory updates
- Bulk order capabilities for corporate buyers
- Enhanced reporting APIs for carbon credit retirement tracking
- Integration with additional payment providers

## Appendix

### Sample Product Data
```json
{
  "sku": "303431",
  "name": "Gold Standard Carbon Credits",
  "price": 15.00,
  "extension_attributes": {
    "project_name": "Wind Farm Project",
    "vintage_year": "2020",
    "certification": "Gold Standard"
  }
}
```

### Environment URLs
- Development: `https://shop-dev.southpole.com/`
- Production: Contact South Pole for production credentials

*Last updated: July 9, 2025*