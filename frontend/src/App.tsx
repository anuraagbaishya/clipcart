import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Recipes from "./pages/Recipes/Recipes";
import AddRecipe from "./pages/AddRecipe/AddRecipe";
import ShoppingList from "./pages/ShoppingList/ShoppingList";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/addRecipe" element={<AddRecipe />} />
        <Route path="/shoppingList" element={<ShoppingList />} />
      </Routes>
    </Router>
  );
}
