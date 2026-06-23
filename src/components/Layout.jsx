import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNavBar from './TopNavBar';
import SideNavBar from './SideNavBar';

const Layout = () => {
  return (
    <div className="bg-surface text-on-surface min-h-screen pt-[56px] pb-xl flex flex-col md:flex-row">
      <TopNavBar />
      <SideNavBar />
      <main className="flex-grow w-full md:ml-60 px-md py-lg md:px-gutter md:py-xl mx-auto max-w-container-max flex flex-col gap-xl">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
