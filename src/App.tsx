import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/LandingPage";
import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";
import Onboarding from "./pages/Onboarding";
import Pathway from "./pages/Pathway";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <CreateAccount /> },
      { path: "onboarding", element: <Onboarding /> },
      { path: "pathway", element: <Pathway /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
