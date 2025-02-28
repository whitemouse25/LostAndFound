import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Report from "./pages/Report";
import Admin from "./pages/Admin";
import Claim from "./pages/Claim";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/report" element={<Report />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/claim" element={<Claim />} />
      </Routes>
    </Router>
  );
}

export default App;
