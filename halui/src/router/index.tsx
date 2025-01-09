import React, { lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

const Login = lazy(() => import('../pages/Login'));
const EggSelect = lazy(() => import('../pages/EggSelect'));
const AgentCustomized = lazy(() => import('../pages/AgentCustomized'));
const PluginLayout = lazy(() => import('../layout/PluginLayout'));
const Chat = lazy(() => import('../pages/Chat'));
const AgentBoard = lazy(() => import('../pages/AgentBoard'));
const WatchList = lazy(() => import('../pages/WatchList'));
const Discover = lazy(() => import('../pages/Discover'));
const Memo = lazy(() => import('../pages/Memo'));
const More = lazy(() => import('../pages/More'));
const Gift = lazy(() => import('../pages/Gift'));
const Device = lazy(() => import('../pages/Device'));
const Help = lazy(() => import('../pages/Help'));
const Setting = lazy(() => import('../pages/Setting'));

const AppRoutes: React.FC = () => {
  return (
    <div className="w-full h-screen light">
      <Suspense fallback={<div className="frc-center w-full h-screen">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route id="login" path="/login" element={<Login />} />
          <Route id="egg-select" path="/egg-select" element={<EggSelect />} />
          <Route id="egg-config" path="/egg-config" element={<AgentCustomized />} />
          <Route id="plugin" path="/plugin" element={<PluginLayout />}>
            <Route path="" element={<Navigate to="chat" />} />
            <Route id="chat" path="chat" element={<Chat />} />
            <Route id="agent" path="agent" element={<AgentBoard />} />
            <Route id="watch-list" path="watch-list" element={<WatchList />} />
            <Route id="discover" path="discover" element={<Discover />} />
            <Route id="memo" path="memo" element={<Memo />} />
            <Route id="more" path="more" element={<More />} />
            <Route id="gift" path="gift" element={<Gift />} />
            <Route id="device" path="device" element={<Device />} />
            <Route id="help" path="help" element={<Help />} />
            <Route id="setting" path="setting" element={<Setting />} />
          </Route>
          <Route path="*" element={<Navigate to="plugin" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default AppRoutes;
