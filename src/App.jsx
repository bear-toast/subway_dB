import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LineView } from "./pages/LineView.jsx";
import { Measure } from "./pages/Measure.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LineView />} />
        <Route path="/measure" element={<Measure />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
