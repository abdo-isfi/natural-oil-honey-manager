# Natural Oil & Honey Manager 🍯

A premium, offline-first web application for managing your natural oil and honey business.

## Features

-   **Dashboard**: Real-time overview of sales, profits, and stock alerts.
-   **Inventory Management**: Add, edit, and delete products with category and unit support.
-   **Sales (POS)**: Point-of-Sale interface for quick transactions. Auto-calculates totals and profits.
-   **Purchase System**: Log stock purchases and supplier details.
-   **Offline Storage**: All data is stored locally in your browser (localStorage). No internet or server required.

## Tech Stack

-   **Frontend**: React (Vite)
-   **Styling**: Vanilla CSS (CSS Modules) with a Premium Gold/Dark theme.
-   **State Management**: React Context API.
-   **Persistence**: LocalStorage.

## How to Run Locally

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start the Development Server**:
    ```bash
    npm run dev
    ```

3.  **Open in Browser**:
    Visit the URL shown in the terminal (usually `http://localhost:5173`).

## Data Management

**Important**: This app uses your browser's LocalStorage.
-   Data is saved automatically.
-   Clearing your browser cache/data will **delete** your business records.
-   Data is not shared between different browsers or devices.

## Project Structure

-   `src/components`: Reusable UI components (Forms, Layout).
-   `src/pages`: Main application pages (Dashboard, Products, Sales, Purchases).
-   `src/services`: `localStorageService.js` handling data persistence.
-   `src/context`: Global state management.
-   `src/styles`: Global CSS variables and themes.
