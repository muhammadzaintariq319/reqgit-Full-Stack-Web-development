import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
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
          <h1 className="font-display-md text-display-md text-on-surface mb-8 border-b border-outline-variant pb-4">Privacy Policy</h1>
          
          <div className="prose prose-slate max-w-none text-on-surface-variant">
            <p className="mb-6">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-title-lg font-bold text-on-surface mt-8 mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, items requested (for delivery services), delivery notes, and other information you choose to provide.
            </p>

            <h2 className="text-title-lg font-bold text-on-surface mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">
              We use the information we collect about you to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Provide, maintain, and improve our Services.</li>
              <li>Perform internal operations, including to prevent fraud and abuse of our Services.</li>
              <li>Send you communications we think will be of interest to you, including information about products, services, promotions, news, and events of ReqGit.</li>
              <li>Personalize and improve the Services.</li>
            </ul>

            <h2 className="text-title-lg font-bold text-on-surface mt-8 mb-4">3. Data Security</h2>
            <p className="mb-4">
              We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
            </p>
            
            <h2 className="text-title-lg font-bold text-on-surface mt-8 mb-4">4. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy, please contact us at privacy@reqgit.com.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
