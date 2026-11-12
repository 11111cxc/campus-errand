import { HashRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Publish from './pages/Publish';
import MyOrders from './pages/MyOrders';
import Auth from './pages/Auth';
import { AuthProvider } from './contexts/AuthContext';

const App = () => (
  <AuthProvider>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/publish" element={<Publish />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </HashRouter>
  </AuthProvider>
);

export default App;
