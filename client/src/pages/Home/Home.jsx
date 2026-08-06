import { useState, useEffect } from 'react';
import HeroSlider from './HeroSlider';
import SearchBox from './SearchBox';
import AboutSection from './AboutSection';
import DestinationsSection from './DestinationsSection';
import UltimateTravelExperience from './UltimateTravelExperience';
import FeaturesSection from './FeaturesSection';
import AffordableVacations from './AffordableVacations';
import DealsSection from './DealsSection';
import ExploreActivities from './ExploreActivities';
import LatestBlog from './LatestBlog';

export default function Home() {
  return (
    <>
      <HeroSlider />
      <SearchBox />
      <AboutSection />
      <DestinationsSection />
      <UltimateTravelExperience />
      <AffordableVacations />
      <FeaturesSection />
      <DealsSection />
      <ExploreActivities />
      <LatestBlog />
      <DestinationsSection />
    </>
  );
}
