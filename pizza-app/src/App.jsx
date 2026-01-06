import { Routes, Route } from "react-router-dom";
import PizzaOrderFormPage from "./pages/PizzaOrderFormPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";

export default function App() {
  return (
    <Routes>
      {/* Public order form */}
      <Route path="/" element={<PizzaOrderFormPage />} />

      {/* Admin dashboard */}
      <Route path="/admin" element={<AdminOrdersPage />} />
    </Routes>
  );
}
