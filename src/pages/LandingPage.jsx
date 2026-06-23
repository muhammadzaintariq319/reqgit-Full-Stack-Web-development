import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const LandingPage = () => {
  const [activeSection, setActiveSection] = useState('');

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      // Offset for the fixed navbar (h-16 = 64px)
      const offset = 64; 
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['features', 'solutions', 'pricing', 'docs'];
      let current = '';

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Check if section is currently active in the viewport (with 100px offset for nav)
          if (rect.top <= 100 && rect.bottom >= 100) {
            current = section;
            break;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getLinkClasses = (sectionId) => {
    const baseClasses = "font-medium transition-colors cursor-pointer ";
    return activeSection === sectionId 
      ? baseClasses + "text-blue-600 border-b-2 border-blue-600 pb-1"
      : baseClasses + "text-slate-600 hover:text-blue-600";
  };

  return (
    <div className="bg-surface text-on-surface font-body-lg min-h-screen flex flex-col">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full bg-surface border-b border-outline-variant transition-all duration-200 z-50">
        <div className="flex justify-between items-center h-16 px-md max-w-container-max mx-auto">
          {/* Brand */}
          <div className="flex items-center">
            <Link className="text-headline-lg font-headline-lg text-primary tracking-tight" to="/">ReqGit</Link>
          </div>
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <span className={getLinkClasses('features')} onClick={() => scrollToSection('features')}>Features</span>
            <span className={getLinkClasses('solutions')} onClick={() => scrollToSection('solutions')}>Solutions</span>
            <span className={getLinkClasses('pricing')} onClick={() => scrollToSection('pricing')}>Pricing</span>
            <span className={getLinkClasses('docs')} onClick={() => scrollToSection('docs')}>Documentation</span>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-sm">
            <Link className="hidden md:block px-4 py-2 font-button text-button text-on-surface hover:bg-surface-container-low rounded transition-colors" to="/login">Log In</Link>
            <Link className="px-4 py-2 font-button text-button bg-primary text-on-primary rounded-lg hover:bg-[#003ea8] active:bg-[#00174b] transition-colors" to="/login">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 px-md flex flex-col items-center justify-center text-center max-w-4xl mx-auto overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-fixed/30 via-surface to-surface"></div>
          <h1 className="font-display-lg text-display-lg text-on-surface mb-6 leading-tight">
            Manage & Collaborate on SRS Documents Like a Pro.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-2xl">
            The ultimate version control platform built for software engineering teams. Bring precision, clarity, and true collaboration to your technical documentation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
            <Link className="px-8 py-3 bg-primary text-on-primary font-button text-button rounded-lg hover:bg-[#003ea8] active:bg-[#00174b] transition-colors shadow-sm hover:shadow-md" to="/login">
              Start for Free
            </Link>
            <span className="px-8 py-3 bg-transparent border border-outline-variant text-on-surface font-button text-button rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer" onClick={() => scrollToSection('docs')}>
              View Documentation
            </span>
          </div>
          
          {/* Hero Image/UI Mockup */}
          <div className="mt-16 w-full max-w-5xl rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm overflow-hidden relative group">
            <div className="h-8 bg-surface-container-low border-b border-outline-variant flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-error-container border border-error"></div>
              <div className="w-3 h-3 rounded-full bg-[#fef08a] border border-[#ca8a04]"></div>
              <div className="w-3 h-3 rounded-full bg-[#bbf7d0] border border-[#16a34a]"></div>
            </div>
            <div className="p-0">
              <img alt="Code interface mockup" className="w-full h-auto object-cover opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDo91GVaIMcclQqMrIBzlj-kdCCq3vgdqj9og82eQIZKFGAMlIxrtRwTK2GkLpIzu6mc8JkQUQbM0izhCjyOW3fYbRfgMAWuB57JBttk0FFtBlw9eF5_K_TMp3EQJgYLpHPALLZMC4HD2EU8ohtlW8dnesQc0dSRFFM632C16Pil38t57Qgd0o06H2NGl8TRn-1l24cVl78ZL8LUcPiY4AAyoHePLsfSxFn5OGtV4P8ThNhf2_xFnqJZknZG9fYeDSVpYbnr3UW_jC1" />
            </div>
          </div>
        </section>

        {/* Features Grid Section */}
        <section id="features" className="py-20 bg-surface-container-low scroll-mt-16">
          <div className="max-w-container-max mx-auto px-md">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Built for Engineering Precision</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">Everything you need to maintain a single source of truth for your software requirements.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 hover:shadow-sm transition-shadow group relative overflow-hidden">
                <div className="w-12 h-12 rounded-lg bg-primary-fixed flex items-center justify-center mb-6 text-on-primary-fixed-variant group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                </div>
                <h3 className="font-title-md text-title-md text-on-surface mb-3">Team Workspaces</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Organize specifications by project, component, or squad. Maintain context with isolated workspaces that keep related documentation centralized.
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 hover:shadow-sm transition-shadow group relative overflow-hidden">
                <div className="w-12 h-12 rounded-lg bg-primary-fixed flex items-center justify-center mb-6 text-on-primary-fixed-variant group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                </div>
                <h3 className="font-title-md text-title-md text-on-surface mb-3">Secure Document Sharing</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Control access with granular permissions. Share specific versions with stakeholders securely, ensuring they only see finalized, approved requirements.
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 hover:shadow-sm transition-shadow group relative overflow-hidden">
                <div className="w-12 h-12 rounded-lg bg-primary-fixed flex items-center justify-center mb-6 text-on-primary-fixed-variant group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
                </div>
                <h3 className="font-title-md text-title-md text-on-surface mb-3">Git-Like Version Control</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Track every change with absolute certainty. View visual diffs, revert to previous states, and maintain a complete audit log of requirement evolution.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section id="solutions" className="py-20 bg-surface border-t border-outline-variant scroll-mt-16">
          <div className="max-w-container-max mx-auto px-md text-center">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Solutions for Every Role</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-16">Tailored workflows for modern software engineering teams.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="bg-surface-container-low rounded-xl p-xl border border-outline-variant">
                <h3 className="font-title-lg text-title-lg text-primary mb-sm">For Software Architects</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Maintain a single source of truth for your system designs, data models, and API contracts. Never wonder if developers are working off an outdated PDF again.</p>
              </div>
              <div className="bg-surface-container-low rounded-xl p-xl border border-outline-variant">
                <h3 className="font-title-lg text-title-lg text-primary mb-sm">For Product Managers</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Ensure engineers are building exactly what was specified. Lock approved requirements and keep stakeholders aligned with granular access controls.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-surface-container-low border-t border-outline-variant scroll-mt-16">
          <div className="max-w-container-max mx-auto px-md text-center">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Simple, Transparent Pricing</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-16">Start for free, upgrade when your team needs advanced features.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto text-left">
              <div className="p-xl bg-surface border border-outline-variant rounded-xl shadow-sm hover:border-primary transition-colors">
                <h3 className="font-title-lg text-title-lg text-on-surface mb-xs">Starter</h3>
                <div className="text-display-md font-display-md text-primary mb-md">$0<span className="text-body-lg text-on-surface-variant">/mo</span></div>
                <ul className="space-y-sm mb-lg">
                  <li className="flex items-center gap-sm text-body-sm"><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span> 1 Workspace</li>
                  <li className="flex items-center gap-sm text-body-sm"><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span> 3 Team Members</li>
                  <li className="flex items-center gap-sm text-body-sm"><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span> Basic Version Control</li>
                </ul>
                <Link to="/login" className="block text-center w-full py-sm bg-surface-container border border-outline-variant rounded-lg font-button text-button hover:bg-surface-container-highest transition-colors">Start Free</Link>
              </div>
              
              <div className="p-xl bg-primary-fixed border border-primary rounded-xl shadow-md relative">
                <div className="absolute top-0 right-0 bg-primary text-on-primary text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg uppercase tracking-wider">Popular</div>
                <h3 className="font-title-lg text-title-lg text-on-primary-fixed-variant mb-xs">Professional</h3>
                <div className="text-display-md font-display-md text-on-primary-fixed-variant mb-md">$29<span className="text-body-lg opacity-80">/mo</span></div>
                <ul className="space-y-sm mb-lg text-on-primary-fixed-variant">
                  <li className="flex items-center gap-sm text-body-sm"><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span> Unlimited Workspaces</li>
                  <li className="flex items-center gap-sm text-body-sm"><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span> Unlimited Members</li>
                  <li className="flex items-center gap-sm text-body-sm"><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span> Advanced Diff Viewer</li>
                </ul>
                <Link to="/login" className="block text-center w-full py-sm bg-primary text-on-primary rounded-lg font-button text-button hover:bg-blue-700 transition-colors">Upgrade to Pro</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Documentation Section */}
        <section id="docs" className="py-20 bg-surface border-t border-outline-variant scroll-mt-16">
          <div className="max-w-container-max mx-auto px-md text-center">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Documentation & API</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-16">Learn how to configure workspaces, manage roles, and use the REST API.</p>
            
            <div className="text-left bg-surface-container-lowest border border-outline-variant rounded-xl p-xl shadow-sm prose prose-slate max-w-3xl mx-auto">
              <h3 className="text-title-lg font-title-lg mb-4 text-on-surface">Getting Started</h3>
              <p className="text-body-md font-body-md mb-6 text-on-surface-variant">Welcome to ReqGit. Our platform allows you to version control your Software Requirements Specification documents similar to how you manage code.</p>
              <h4 className="text-title-md font-title-md mb-2 text-on-surface">Creating a Workspace</h4>
              <p className="text-body-md font-body-md mb-6 text-on-surface-variant">A Workspace acts as an isolated team environment. Admins can invite editors and viewers to collaborate safely. Simply head to your dashboard after logging in to create your first space.</p>
              
              <div className="bg-surface-container border border-outline-variant p-4 rounded text-center">
                <Link to="/login" className="text-primary font-medium hover:underline">Read the full API Documentation →</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
