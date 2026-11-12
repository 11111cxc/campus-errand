import { HashRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Publish from './pages/Publish';
import MyOrders from './pages/MyOrders';

const App = () => (
  <HashRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/publish" element={<Publish />} />
      <Route path="/my-orders" element={<MyOrders />} />
    </Routes>
  </HashRouter>
);

export default App;
