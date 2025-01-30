import './App.css';
import Hosting from './views/Hosting';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import 'virtual:uno.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hosting />} />
      </Routes>
    </Router>
  );
}

export default App;
