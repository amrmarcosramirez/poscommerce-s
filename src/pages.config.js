import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import Invoices from './pages/Invoices';
import Stores from './pages/Stores';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "POS": POS,
    "Products": Products,
    "Sales": Sales,
    "Customers": Customers,
    "Invoices": Invoices,
    "Stores": Stores,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};