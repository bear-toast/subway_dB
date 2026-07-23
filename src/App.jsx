import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LineView } from "./pages/LineView.jsx";
import { Measure } from "./pages/Measure.jsx";

function App() {
  return (
    <BrowserRouter>
      <div className="phone-shell">
        <div className="phone-notch" />
        <div className="phone-frame">
          <Routes>
            <Route path="/" element={<LineView />} />
            <Route path="/measure" element={<Measure />} />
          </Routes>
        </div>
        <div className="phone-home-indicator" />
      </div>
    </BrowserRouter>
  );
}

export default App;
