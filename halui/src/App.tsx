import './App.css';
import Layout from './layout';
import Hosting from './views/Hosting';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import 'virtual:uno.css';

function App() {
  return (
    <Layout>
      <Router>
        <Routes>
          <Route path="/" element={<Hosting />} />
        </Routes>
      </Router>
    </Layout>
  );
}

export default App;
