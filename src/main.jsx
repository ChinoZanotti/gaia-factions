// Mismo orden de estilos que el index.html original: tokens → sistema de diseño → app.
import './styles/tokens.css';
import './styles/bundle.css';
import './styles/app.css';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
