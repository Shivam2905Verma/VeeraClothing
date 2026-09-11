import { Routes, Route } from "react-router-dom";
import WebsiteLayout from "./main/layout/WebsiteLayout";
import Home from "./main/pages/home/Home";

const App = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <WebsiteLayout>
            <Home />
          </WebsiteLayout>
        }
      />
    </Routes>
  );
};

export default App;
