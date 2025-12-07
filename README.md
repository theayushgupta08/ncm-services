# NCM Services - Electronic Invoice Generator

A modern web application for **New Calcutta Motors** to generate professional electronic invoices (E-Bills) with PDF export functionality. Built with React, TypeScript, and Vite.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Usage](#usage)
- [Invoice Features](#invoice-features)
- [Pages](#pages)
- [Development](#development)
- [Build & Deployment](#build--deployment)

## 🎯 Overview

NCM Services is a comprehensive invoice management system designed for New Calcutta Motors. The application allows users to:

- Generate professional invoices for multiple shop locations
- Export invoices as PDF documents
- View company information and contact details
- Access an interactive map showing business location

The application supports two shop locations:
- **Calcutta Motors**
- **New Calcutta Motors**

## ✨ Features

### Core Functionality
- ✅ **Multi-Shop Invoice Generation**: Support for multiple shop locations with different GSTIN and bank details
- ✅ **Dynamic Invoice Form**: Fully editable invoice with real-time calculations
- ✅ **PDF Export**: Generate and download invoices as PDF files
- ✅ **Automatic Tax Calculations**: CGST, SGST, and IGST calculations
- ✅ **Amount in Words**: Automatic conversion of invoice amount to words (Indian numbering system)
- ✅ **Responsive Design**: Mobile-friendly interface with modern UI/UX

### Additional Features
- 📍 **Interactive Map**: Leaflet-based map showing business location
- 📝 **Contact Form**: Customer inquiry form
- 🏢 **About Page**: Company information and statistics
- 🎨 **Modern UI**: Clean, professional design with smooth animations

## 🛠 Technologies Used

### Core
- **React** 19.2.0 - UI library
- **TypeScript** 5.9.3 - Type-safe JavaScript
- **Vite** 7.2.4 - Build tool and dev server

### Routing & Navigation
- **React Router DOM** 7.10.1 - Client-side routing

### PDF Generation
- **jsPDF** 3.0.4 - PDF document generation
- **html2canvas** 1.4.1 - HTML to canvas conversion

### Maps
- **Leaflet** 1.9.4 - Interactive maps
- **React Leaflet** 5.0.0 - React bindings for Leaflet

### Development Tools
- **ESLint** 9.39.1 - Code linting
- **TypeScript ESLint** 8.46.4 - TypeScript-specific linting rules

## 📁 Project Structure

```
ncm-services/
├── public/                 # Static assets
│   └── vite.svg
├── src/
│   ├── assets/            # Images and other assets
│   │   └── react.svg
│   ├── components/         # Reusable components
│   │   ├── Navbar.tsx     # Navigation bar component
│   │   └── Navbar.css
│   ├── pages/             # Page components
│   │   ├── Home.tsx       # Landing page with shop selection
│   │   ├── Home.css
│   │   ├── About.tsx      # About us page
│   │   ├── About.css
│   │   ├── Contact.tsx    # Contact page with form and map
│   │   ├── Contact.css
│   │   ├── Invoice.tsx    # Invoice generator page
│   │   └── Invoice.css
│   ├── App.tsx            # Main app component with routing
│   ├── App.css            # Global app styles
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── eslint.config.js       # ESLint configuration
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher recommended)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository** (or navigate to the project directory)
   ```bash
   cd ncm-services
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:5173` (or the port shown in terminal)

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot module replacement |
| `npm run build` | Build the project for production (outputs to `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint to check code quality |

## 💻 Usage

### Generating an Invoice

1. **Navigate to Home Page**
   - Click on "Home" in the navigation bar
   - You'll see two shop options: "Calcutta Motors" and "New Calcutta Motors"

2. **Select a Shop**
   - Click on the shop card you want to generate an invoice for
   - You'll be redirected to the invoice page with pre-filled shop details

3. **Fill Invoice Details**
   - **Invoice Number** (required): Enter a unique invoice number
   - **Date**: Select the invoice date (defaults to today)
   - **Receiver Details**:
     - Name (required)
     - Address
     - GSTIN/UIN
     - Vehicle Number

4. **Add Items**
   - Fill in item details in the table:
     - Description
     - HSN/SAC code
     - Quantity
     - Rate
   - Amount is automatically calculated (Quantity × Rate)
   - Up to 12 items can be added

5. **Configure Taxes**
   - CGST percentage (default: 9%)
   - SGST percentage (default: 9%)
   - IGST is automatically calculated

6. **Generate PDF**
   - Click "Print Invoice" button
   - The invoice will be generated as a PDF and downloaded
   - Filename format: `[First10CharsOfName]_[InvoiceNumber].pdf`

### Other Pages

- **About**: View company information, mission, values, and statistics
- **Contact**: 
  - Fill out the contact form
  - View contact information (address, phone, email)
  - See business location on interactive map

## 🧾 Invoice Features

### Automatic Calculations
- **Item Amount**: Quantity × Rate (auto-calculated)
- **Total Before Tax**: Sum of all item amounts
- **CGST**: Percentage of total before tax
- **SGST**: Percentage of total before tax
- **IGST**: Automatically calculated to round up to next whole number
- **Total After Tax**: Sum of all amounts including taxes

### Amount in Words
- Automatically converts the total invoice amount to words
- Uses Indian numbering system (Lakhs, Crores)
- Example: ₹1,50,000 → "One Lakh Fifty Thousand only"

### PDF Generation
- High-quality PDF export
- A4 page format
- Professional layout with proper formatting
- All input fields are converted to text in PDF
- Date format conversion (YYYY-MM-DD → DD-MM-YYYY)

### Validation
- Required fields: Invoice Number and Receiver Name
- Error messages for missing required fields
- Visual indicators for validation errors

## 📄 Pages

### Home (`/`)
- Hero section with company name
- Shop selection cards
- Navigation to invoice generation

### About (`/about`)
- Company story and mission
- Core values
- Statistics (customers, experience, satisfaction)

### Contact (`/contact`)
- Contact information display
- Contact form with validation
- Interactive map showing business location
- Clickable phone numbers and email

### Invoice (`/invoice/:shopName`)
- Dynamic route based on shop name
- Full invoice generation interface
- Editable form fields
- PDF export functionality
- Reset button to clear all fields
- Back button to return to home

## 🔧 Development

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Functional components with hooks
- CSS modules for styling

### Adding New Shops
To add a new shop location:

1. Update `src/pages/Home.tsx`:
   - Add a new card in the `cards-container`
   - Use `handleCardClick` with the shop name

2. Update `src/pages/Invoice.tsx`:
   - Add shop detection logic in the component
   - Add shop-specific data (GSTIN, bank account, etc.) in `invoiceData`

### Customization
- **Styling**: Modify CSS files in respective component directories
- **Invoice Template**: Edit `src/pages/Invoice.tsx` and `Invoice.css`
- **Company Info**: Update contact information in `Contact.tsx` and `Invoice.tsx`

## 🏗 Build & Deployment

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Deployment Options

The `dist/` folder can be deployed to:
- **Netlify**: Drag and drop the `dist` folder
- **Vercel**: Connect your repository for automatic deployments
- **GitHub Pages**: Configure to serve from `dist` folder
- **Any static hosting service**: Upload the `dist` folder contents

### Environment Variables

Currently, no environment variables are required. All configuration is done directly in the code.

## 📝 Notes

- The application uses client-side routing (React Router)
- PDF generation requires a modern browser with JavaScript enabled
- Map functionality requires internet connection (uses OpenStreetMap tiles)
- Invoice data is not persisted - it's generated on-demand

## 🤝 Contributing

This is a private project for New Calcutta Motors. For any modifications or improvements, please contact the project maintainer.

## 📄 License

Private project - All rights reserved.

---

**Developed for New Calcutta Motors** 🚗

For questions or support, please contact: alokshaw83@gmail.com
