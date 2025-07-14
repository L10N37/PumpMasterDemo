# 🚰 Pump Master Application - Setup Guide

**Framework:** Bootstrap 5.3 + jQuery 3.6

---

## 1. Overview

The Pump Master Application is a comprehensive web-based pump management system designed to monitor and manage industrial pumps across multiple fields. The application provides secure user authentication, real-time pump monitoring, and intuitive data visualization through a responsive web interface.

### 1.1 Key Features

- Secure user authentication system  
- Real-time pump monitoring dashboard  
- User-specific pump data filtering  
- Responsive design for mobile and desktop  
- Pressure status monitoring with visual indicators  
- Session management and automatic logout  

---

## 2. System Requirements

### 2.1 Browser Compatibility

- Chrome 70+ (recommended)  
- Firefox 65+  
- Safari 12+  
- Edge 79+  

### 2.2 Network Requirements

- Internet connection for API access  
- Access to Azure-hosted services  
- HTTPS support for secure authentication  

---

## 3. Installation and Setup

### 3.1 Deployment Options

**Option 1: Local Development**

1. Extract the ZIP file to your desired directory  
2. Open `index.html` in a web browser (e.g., via Live Server at `http://127.0.0.1:5500`)  
3. The application will run locally without requiring a web server  
4. **Note:** Backend CORS policy allows requests from `http://127.0.0.1:5500` for local development

**Option 2: Web Server Deployment**

1. Upload all files to your web server  
2. Ensure HTTPS is enabled for secure authentication  
3. Access the application via your domain URL  
4. Update backend CORS settings to whitelist your deployment domain (e.g., GitHub Pages domain)

---

## 4. API Configuration

### 4.1 Authentication API

- **Endpoint:** `https://pumpmaster-auth.azurewebsites.net/api/login`  
- **Method:** POST  
- **Request Body Example:**

```json
{
  "username": "user1",
  "password": "Password1!"
}
```

### 4.2 Pump Data API

- **Endpoint:** `https://pumpmaster-api-demo.azurewebsites.net/api/pumps`  
- **Method:** GET  
- **Response Format:** JSON array of pump objects  

---

## 5. Usage Instructions

### 5.1 Login Process

1. Open the application in your web browser  
2. Enter your username and password  
3. Click "Login" to authenticate  
4. Upon successful login, you will be redirected to the dashboard  

### 5.2 Dashboard Navigation

1. View your assigned pumps in the main table  
2. Monitor pump status through color-coded indicators  
3. Review pump specifications and current readings  
4. Use the logout button to end your session  

---

## 6. Data Structure

### 6.1 Pump Object Schema

| Field           | Type    | Description                     |
|-----------------|---------|---------------------------------|
| id              | Integer | Unique pump identifier          |
| latitude        | Float   | GPS latitude coordinate         |
| longitude       | Float   | GPS longitude coordinate        |
| pumpType        | String  | Type of pump (e.g., Centrifugal)|
| area            | String  | Field area designation          |
| flowRate        | Float   | Current flow rate in L/min      |
| offset          | Float   | Pressure offset value           |
| currentPressure | Float   | Current pressure reading        |
| minPressure     | Float   | Minimum operating pressure      |
| maxPressure     | Float   | Maximum operating pressure      |
| userId          | Integer | Associated user identifier      |

---

## 7. Status Indicators

### 7.1 Pressure Status Colors

- **Green (Normal):** Pressure within normal operating range  
- **Yellow (Warning):** Pressure approaching limits  
- **Red (Critical):** Pressure outside safe operating range  

---

## 8. Troubleshooting

### 8.1 Common Issues

**Login Failed:**

- Verify username and password are correct  
- Check internet connection  
- Ensure API endpoint is accessible  

**No Pump Data Displayed:**

- Confirm user has assigned pumps  
- Check network connectivity  
- Verify API endpoint is responding  

**Layout Issues:**

- Clear browser cache and cookies  
- Ensure browser supports modern CSS features  
- Try a different browser  

---

## 9. Security Considerations

- Always use HTTPS in production environments  
- Implement proper session timeout mechanisms  
- Regularly update authentication credentials  
- Monitor API access logs for suspicious activity  

---

## 10. Support and Maintenance

-NIL - Demo app

---

## 11. Version History

| Version | Date         | Changes                                                |
|---------|--------------|--------------------------------------------------------|
| 1.0     | 14/07/2025   | Initial release with login and dashboard functionality |

---

## 📦 Packages Used

- **Chart.js**  
  A flexible JavaScript library for rendering responsive line and bar charts to visualize pump pressure data over time.

- **Leaflet.js**  
  Lightweight and open-source library for interactive maps showing pump locations with OpenStreetMap tiles.

- **jQuery**  
  Simplifies AJAX requests and DOM manipulation, allowing dynamic content updates without page reloads.

- **Bootstrap 5**  
  Provides responsive layouts and prebuilt UI components for consistent design across devices.

- **FontAwesome 6.4**  
  Supplies scalable vector icons used throughout the UI for enhanced visual experience.

---

## 🔧 Assumptions Made

- Pump pressure readings update hourly, providing 24-hour historical data for charts.  
- Pumps are associated with users via a `userId` to enable user-specific views.  
- The frontend is a static client that consumes an existing backend API hosted on Microsoft Azure.  
- CORS is configured on the backend to allow local development at `http://127.0.0.1:5500`.  
- CORS settings must be updated to whitelist the GitHub Pages domain or other production domains upon deployment.

---

## 🌐 CORS Policy Notes

- CORS policy currently allows `http://127.0.0.1:5500` for local Live Server development.  
- For deployment to GitHub Pages or other hosts, backend CORS policies must be updated to allow requests from those origins.

---

