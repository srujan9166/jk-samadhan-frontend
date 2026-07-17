import React from 'react';
import Hero from './Hero';
import MobileShowcase from './MobileShowcase';
import AboutUs from './AboutUs';
import StepsToLodge from './StepsToLodge';
import Footer from '../../components/layout/Footer';

export default function Landing() {
  return (
    <div className="flex-1 flex flex-col">
      <Hero />
      <MobileShowcase />
      <AboutUs />
      <StepsToLodge />
      <Footer />
    </div>
  );
}
