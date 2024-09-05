import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import Preloader from './Preloader.jsx';
import App from './App.jsx';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/authContext.jsx';
import 'react-toastify/dist/ReactToastify.css';
import "./index.css";

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <Preloader />
      <App />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        bodyClassName="toastBody"
      />
    </AuthProvider>
  </BrowserRouter>
);
