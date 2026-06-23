import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const TermsOfService = () => {
  return (
    <div className="bg-surface text-on-surface font-body-lg min-h-screen flex flex-col">
      {/* Simple TopNavBar */}
      <nav className="fixed top-0 w-full bg-surface border-b border-outline-variant transition-all duration-200 z-50">
        <div className="flex justify-between items-center h-16 px-md max-w-container-max mx-auto">
          <div className="flex items-center">
            <Link className="text-headline-lg font-headline-lg text-primary tracking-tight" to="/">ReqGit</Link>
          </div>
          <div className="flex items-center gap-sm">
            <Link className="px-4 py-2 font-button text-button bg-primary text-on-primary rounded-lg hover:bg-blue-700 transition-colors" to="/login">Go to App</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-32 px-md pb-xl max-w-4xl mx-auto w-full">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 md:p-12 shadow-sm">
          <h1 className="font-display-md text-display-md text-on-surface mb-8 border-b border-outline-variant pb-4">Terms of Service</h1>
          
          <div className="prose prose-slate max-w-none text-on-surface-variant">
            <p className="mb-6">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-title-lg font-bold text-on-surface mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using ReqGit, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services. Any participation in this service will constitute acceptance of this agreement.
            </p>

            <h2 className="text-title-lg font-bold text-on-surface mt-8 mb-4">2. Provision of Services</h2>
            <p className="mb-4">
              You agree and acknowledge that ReqGit is entitled to modify, improve or discontinue any of its services at its sole discretion and without notice to you even if it may result in you being prevented from accessing any information contained in it. Furthermore, you agree and acknowledge that ReqGit is entitled to provide services to you through subsidiaries or affiliated entities.
            </p>

            <h2 className="text-title-lg font-bold text-on-surface mt-8 mb-4">3. Proprietary Rights</h2>
            <p className="mb-4">
              You acknowledge and agree that ReqGit may contain proprietary and confidential information including trademarks, service marks and patents protected by intellectual property laws and international intellectual property treaties. ReqGit authorizes you to view and make a single copy of portions of its content for offline, personal, non-commercial use. Our content may not be sold, reproduced, or distributed without our written permission.
            </p>
            
            <h2 className="text-title-lg font-bold text-on-surface mt-8 mb-4">4. Termination of Agreement</h2>
            <p className="mb-4">
              The Terms of this agreement will continue to apply in perpetuity until terminated by either party without notice at any time for any reason. Terms that are to continue in perpetuity shall be unaffected by the termination of this agreement.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
