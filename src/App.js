import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './services/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import ProductList from './pages/Products/ProductList';
import AddProduct from './pages/Products/AddProduct';
import EditProduct from './pages/Products/EditProduct';
import GenerateBill from './pages/Bills/GenerateBill';
import BillList from './pages/Bills/BillList';
import BillDetails from './pages/Bills/BillDetails';

function App() {
  return (
   
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes */}
        <Route 
          path="/" 
          element={isAuthenticated() ? <Layout /> : <Navigate to="/login" replace />}
        >
          {/* Default redirect */}
          <Route index element={<Navigate to="products" replace />} />
          
          {/* Product routes */}
          <Route path="products" element={<ProductList />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<EditProduct />} />
          
          {/* Bill routes */}
          <Route path="bills" element={<BillList />} />
          <Route path="bills/generate" element={<GenerateBill />} />
          <Route path="bills/:invoiceNumber" element={<BillDetails />} />
        </Route>
        
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;