/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Billing from './pages/Billing';
import Categories from './pages/Categories';
import Customers from './pages/Customers';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Invoices from './pages/Invoices';
import Landing from './pages/Landing';
import Loyalty from './pages/Loyalty';
import Onboarding from './pages/Onboarding';
import POS from './pages/POS';
import Products from './pages/Products';
import Reports from './pages/Reports';
import Sales from './pages/Sales';
import Settings from './pages/Settings';
import Stores from './pages/Stores';
import TeamMembers from './pages/TeamMembers';
import TrialExpired from './pages/TrialExpired';
import eCommerce from './pages/eCommerce';
import eCommerceInfo from './pages/eCommerceInfo';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Billing": Billing,
    "Categories": Categories,
    "Customers": Customers,
    "Dashboard": Dashboard,
    "Home": Home,
    "Invoices": Invoices,
    "Landing": Landing,
    "Loyalty": Loyalty,
    "Onboarding": Onboarding,
    "POS": POS,
    "Products": Products,
    "Reports": Reports,
    "Sales": Sales,
    "Settings": Settings,
    "Stores": Stores,
    "TeamMembers": TeamMembers,
    "TrialExpired": TrialExpired,
    "eCommerce": eCommerce,
    "eCommerceInfo": eCommerceInfo,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};