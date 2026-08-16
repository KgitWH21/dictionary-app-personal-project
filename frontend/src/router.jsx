import { createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import CollectionDetailPage from "./pages/CollectionDetailPage.jsx"
import ErrorPage from "./pages/ErrorPage.jsx";
import {
    redirectIfLoggedIn,
    homeLoader,
    collectionLoader,
    userConfirmation,
} from "./api/utilities.js";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        loader: userConfirmation,
        errorElement: <ErrorPage />,
        children: [
            { 
                index: true, 
                element: <LoginPage />, 
                loader: redirectIfLoggedIn 
            },
            { 
                path: "register", 
                element: <RegisterPage />, 
                loader: redirectIfLoggedIn 
            },
            { 
                path: "home", 
                element: <HomePage />, 
                loader: homeLoader 
            },
            {
                path: "collections/:id",
                element: <CollectionDetailPage />,
                loader: collectionLoader,
            },
        ],
    },
]);