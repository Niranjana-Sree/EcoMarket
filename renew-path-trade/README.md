# EcoMarket - Turn Your Waste Into Worth

A sustainable marketplace platform that connects buyers, sellers, and recyclers in the circular economy. Transform waste materials into valuable resources while contributing to environmental sustainability.

## 🌱 About EcoMarket

EcoMarket is a comprehensive waste management platform that enables:

- **Waste Trading**: Buy and sell waste materials with transparent pricing
- **Recycling Services**: Connect with local recyclers for proper waste processing
- **Role-Based Access**: Separate dashboards for buyers, sellers, and recyclers
- **Payment Integration**: Secure transactions with Razorpay (India-compatible)
- **AI-Powered Guidance**: Smart recommendations for sell vs recycle decisions

## 🚀 Features

### For Buyers
- Browse available waste materials
- Secure payment processing
- Order tracking and history
- Connect with verified sellers

### For Sellers
- List waste materials for sale
- Set competitive pricing
- Manage inventory
- Track sales performance

### For Recyclers
- Accept recycling requests
- Manage request lifecycle (pending → in-progress → completed)
- Connect with waste generators
- Build sustainable business relationships

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth + Functions)
- **Payments**: Razorpay integration
- **AI**: Gemini API for waste guidance
- **Build Tool**: Vite
- **Routing**: React Router

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Razorpay account (for payments)
- Gemini API key (for AI features)

### Local Development

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd renew-path-trade

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your API keys to .env

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Razorpay
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

# Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## 🗄️ Database Schema

### Tables
- **profiles**: User information and roles
- **products**: Waste materials for sale
- **orders**: Purchase transactions
- **recycle_requests**: Recycling service requests

### Key Relationships
- Users can have multiple products (sellers)
- Users can place multiple orders (buyers)
- Users can accept multiple recycling requests (recyclers)

## 🚀 Deployment

### Supabase Functions
```bash
# Install Supabase CLI
npm install -g supabase

# Deploy payment function
supabase functions deploy create-payment
```

### Environment Setup
1. Set up Supabase project
2. Configure Razorpay keys in Supabase environment
3. Deploy functions
4. Set up database tables and RLS policies

## 📱 Usage

### Getting Started
1. **Sign Up**: Choose your role (buyer/seller/recycler)
2. **Complete Profile**: Add contact and address information
3. **Start Trading**: 
   - Sellers: List your waste materials
   - Buyers: Browse and purchase items
   - Recyclers: Accept recycling requests

### Key Workflows

#### Selling Waste
1. Navigate to Marketplace
2. Click "Add Product"
3. Fill in material details and pricing
4. Wait for buyers to purchase

#### Buying Materials
1. Browse Marketplace
2. Click "Buy" on desired items
3. Complete payment via Razorpay
4. Track order status

#### Recycling Services
1. Go to Recycling Services
2. Select a recycler
3. Create recycling request
4. Track request status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌍 Impact

EcoMarket contributes to:
- **Environmental Sustainability**: Reducing waste in landfills
- **Circular Economy**: Promoting resource reuse and recycling
- **Economic Growth**: Creating new revenue streams from waste
- **Community Building**: Connecting local waste management stakeholders

## 📞 Support

For support, email support@ecomarket.com or create an issue in this repository.

---

**EcoMarket** - Building a sustainable future, one transaction at a time. 🌱♻️