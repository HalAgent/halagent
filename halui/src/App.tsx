import './App.css';
import Layout from './layout';
import Hosting from './views/Hosting';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import 'virtual:uno.css';
import Login from './views/Login';
import Pick from './views/Pick';

function App() {
  return (
    <Layout>
      <Router>
        <Routes>
          <Route path="/" element={<Hosting />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Pick" element={<Pick />} />
        </Routes>
      </Router>
    </Layout>
  );
}

export default App;
