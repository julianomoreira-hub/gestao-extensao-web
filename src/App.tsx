import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import NovaSolicitacao from "./pages/NovaSolicitacao";
import Demandas from "./pages/Demandas";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/nova-solicitacao" element={<NovaSolicitacao />} />
        <Route path="/demandas" element={<Demandas />} />
      </Route>
    </Routes>
  );
}

