import './App.css';
import Layout from './layout';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import 'virtual:uno.css';
import { Suspense, lazy } from 'react';
import GoogleLoginComponent from './views/Login2/GoogleLoginComponent';

const Hosting = lazy(() => import('./views/Hosting'));
const Login = lazy(() => import('./views/Login'));
const Login2 = lazy(() => import('./views/Login2'));
const Pick = lazy(() => import('./views/Pick'));
const WatchList = lazy(() => import('./views/WatchList'));
const Memo = lazy(() => import('./views/Memo'));
const Search = lazy(() => import('./views/Search'));
const Chat = lazy(() => import('./views/Chat'));
const LoginPopup = lazy(() => import('./views/Popup/login'));

function App() {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<div></div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/watchlist" replace />} />
            <Route path="/hosting" element={<Hosting />} />
            <Route path="/login" element={<Login />} />
            <Route path="/pick" element={<Pick />} />
            <Route path="/watchlist" element={<WatchList />} />
            <Route path="/memo" element={<Memo />} />
            <Route path="/search" element={<Search />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/popup-login" element={<LoginPopup />} />
            <Route path="/login2" element={<Login2 />} />
            <Route path="/oauth2callback" element={<GoogleLoginComponent />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
