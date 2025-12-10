import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import Invoices from './pages/Invoices';
import Stores from './pages/Stores';
import eCommerce from './pages/eCommerce';
import eCommerceInfo from './pages/eCommerceInfo';
import Categories from './pages/Categories';
import Reports from './pages/Reports';
import Loyalty from './pages/Loyalty';
import Onboarding from './pages/Onboarding';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "POS": POS,
    "Products": Products,
    "Sales": Sales,
    "Customers": Customers,
    "Invoices": Invoices,
    "Stores": Stores,
    "eCommerce": eCommerce,
    "eCommerceInfo": eCommerceInfo,
    "Categories": Categories,
    "Reports": Reports,
    "Loyalty": Loyalty,
    "Onboarding": Onboarding,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};