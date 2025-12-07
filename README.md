
## Introduction
# Cafe W Fen - Coffee Chain Management System
Cafe W Fen is a centralized management platform designed for coffee shop chains. The system streamlines business operations at each branch while providing comprehensive oversight for the entire chain. It covers product management, order processing, inventory control, user roles, revenue tracking, and profit statistics, ensuring accuracy, flexibility, and scientific management.


## Features
- **Centralized Management:** Manage all branches, employees, products, materials, orders, and customers from a single platform.
- **Role-Based Access:** Supports Admin, Manager, Employee, and Customer roles with strict permission controls.
- **Order Management:** Real-time tracking for dine-in and take-away orders.
- **Inventory Management:** Track stock levels, manage imports/exports, and receive low-stock alerts per branch.
- **Modern Payments:** Integrates QR code, e-wallets (MoMo, VNPay), and bank transfers.
- **Smart Reporting:** Revenue, profit, best-selling products, staff performance, and customer statistics by day, week, or month.
- **Scalable Design:** Ready for future features like loyalty points, accounting/CRM integration, and multi-platform support (Web & Mobile).

## System Scope
- Multi-branch, multi-role architecture.
- Independent branch operations with centralized reporting.
- Flexible user permissions and data separation.
- Designed for Admins, Managers, Employees, and Customers.

## User Roles

- **Admin:** Owner of the coffee chain, manages the entire system including all branches. Responsibilities include managing branches, employees, customers, ingredients, products, orders, campaigns and discount codes, product reviews across the chain, and generating chain-wide reports and statistics.
- **Manager:** Manages a specific branch. Has similar responsibilities to Admin but limited to their branch: manages employees, customers, ingredients, products, orders, campaigns and discount codes, branch-specific reports and statistics, table management, and product reviews from branch orders.
- **Employee:** Acts as a cashier at the counter, supports customers with direct ordering at the shop. After selecting a table, the employee assists with placing orders and processing payments. Employees manage orders (including updating order statuses), manage customers, and view the list of branch employees.
- **Customer:** Can shop for products (login not required), add items to cart, browse the menu, view product details, place orders, track order status, view order details, and manage account information. For completed orders, customers can review each product in the order.

## Main Functions
- **Employee Management:** Track staff by branch and manage employee information.
- **Inventory Management:** Monitor ingredients, set minimum stock thresholds, and allocate materials per branch.
- **Sales Management:** Manage menu, orders (dine-in/take-away), table status, and automatic invoice generation.
- **Revenue & Reporting:** Track all financial activities, generate customizable reports, and analyze business performance.
- **Customer Management:** Store customer info and apply discounts based on spending tiers.

## Prerequisites
- [Node.js](https://nodejs.org/) >= 14.x
- [Yarn](https://yarnpkg.com/) package manager
- Backend API server (SE347 Coffee Chain API)

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/junkyedh/SE347-Coffee-Chain-System.git
   cd SE347-web
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Configure environment variables:**
   
  Copy `.env.example` to `.env` and update it with your settings:
  ```bash
  cp .env.example .env
  ```

  Then edit the `.env` file with your configuration:
  ```env
  REACT_APP_API_URL=http://localhost:3000
  REACT_APP_BASE_URL=http://localhost:3000
  REACT_APP_VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
  REACT_APP_VNPAY_RETURN_URL=http://localhost:3000/vnpay-callback
  ```

  📖 **See detailed instructions:** [ENVIRONMENT_SETUP.md](./docs/ENVIRONMENT_SETUP.md)

## How to Run

### Development Mode
```bash
yarn start
```
The application will run on [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
yarn build
```
This will create an optimized production build in the `build/` folder.

### Running Tests
```bash
yarn test
```

## Project Structure
```
SE347-web/
├── public/              # Static files
├── src/
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Reusable components
│   │   ├── admin/      # Admin-specific components
│   │   ├── common/     # Shared components
│   │   └── customer/   # Customer-facing components
│   ├── hooks/          # Custom React hooks
│   ├── layouts/        # Layout components
│   ├── pages/          # Page components
│   │   ├── admin/      # Admin pages
│   │   └── customer/   # Customer pages
│   ├── routes/         # Route configuration
│   ├── services/       # API services
│   ├── styles/         # Global styles
│   └── utils/          # Utility functions
├── .env.example        # Environment variables template
└── package.json        # Project dependencies
```

## Available Scripts

- **`yarn start`** - Runs the app in development mode
- **`yarn build`** - Builds the app for production
- **`yarn test`** - Launches the test runner
- **`yarn eject`** - Ejects from Create React App (one-way operation)

## Deployment

### Build for Production
```bash
yarn build
```

The build folder will contain the optimized production files ready to be deployed.

### Deploy to Static Hosting
The production build can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting

Example deployment to a web server:
```bash
# After building
yarn build

# Copy the build folder to your web server
scp -r build/* user@server:/var/www/html/
```

## Environment Variables

The following environment variables are supported:

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API endpoint | `http://localhost:5000/api` |
| `REACT_APP_BASE_URL` | Frontend base URL | `http://localhost:3000` |
| `REACT_APP_VNPAY_URL` | VNPay payment gateway URL | `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html` |
| `REACT_APP_VNPAY_RETURN_URL` | VNPay callback URL | `http://localhost:3000/vnpay-callback` |
| `REACT_APP_ENVIRONMENT` | Environment mode | `development` or `production` |

## How to Contribute
1. Fork this repository.
2. Create a new branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request.

## Acknowledgements
- Inspired by real-world coffee chain management needs.
- Thanks to all contributors and open-source libraries used in this project.

## License
This project is licensed under the [MIT License](LICENSE).

