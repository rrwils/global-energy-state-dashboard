import { useState } from 'react'
import './App.css'
import { ResponsiveRenewableLines } from './RenewableLines.jsx';
import { data } from './data.js';
import { ResponsiveEnergyMixStackedArea } from './EnergyMixStackedArea.jsx';
import { ResponsiveCountryComparisonBar } from './CountryComparisonBar.jsx';
import { ResponsiveEnergyMixTreemap } from './EnergyMixTreemap.jsx';
import { ResponsiveCountryComparisonRenewablesBar } from './CountryComparisonRenewablesBar.jsx';
import { ResponsiveRenewableEnergyStackedBar } from './RenewableEnergyStackedBar.jsx';

function App() {
  
  const [selectedCountry, setSelectedCountry] = useState(null);
  return (
    <>
      <div className="header">
        <h1 className="text-xl text-black font-extrabold">Energy Consumption Dashboard</h1>
        <p className="text-[10px] text-gray-600">Data source: <a class="underline decoration-1" href="https://ourworldindata.org/grapher/energy-consumption-by-source-and-country">Our World in Data</a></p>
      </div>
      
      <p className="text-base ml-5 mt-6 mb-4 pr-4 text-black">Over the past six decades, global energy consumption quadrupled. Renewables accounted for 17.5% of the total increase in energy consumption over this period. However, fossil fuels — <span class="underline decoration-3 decoration-[#7f5a2e]">oil</span>, <span class="underline decoration-3 decoration-[#a1885a]">coal</span> and <span class="underline decoration-3 decoration-[#fdd49e]">gas</span> — still dominate the global energy landscape, making up around four-fifths of global energy consumption in 2024.</p>
      <div className="comparison-container">
        <div className="comparison-item">
          <p className="text-sm font-semibold font-[Helvetica] ml-5 mt-2">World's energy consumption by source</p>
          <ResponsiveEnergyMixStackedArea data={data} />
        </div>
        <div className="comparison-item">
          <p className="text-sm font-semibold font-[Helvetica] ml-5 mt-2">World's energy consumption mix</p>
          <ResponsiveEnergyMixTreemap data={data} />
        </div>

      </div>

      <p className="text-base ml-5 mt-6 mb-4 pr-4 text-black"><span class="underline decoration-3 decoration-[#66c2a5]">Wind</span> and <span class="underline decoration-3 decoration-[#ffd92f]">solar</span> energy are the fastest growing sources in the renewable space, particularly in the last decade.</p>
        <div>
          <p className="text-sm font-semibold font-[Helvetica] ml-5 mt-2">World's energy consumption, renewables only</p>
          <ResponsiveRenewableLines data={data} />
        </div>
        
      <p className="text-base ml-5 mt-6 mb-4 pr-4 text-black">Let's look at the top 10 countries by energy consumption in 2024. The top three are also the world's most populous. India overtook China in population in 2023, yet China consumed more energy than India and the US combined in 2024.
      </p>
        
      <div className="comparison-container">

        <div className="comparison-item">
            <p className="text-sm font-semibold font-[Helvetica] ml-5 mt-2">Total energy consumption, 2024</p>
            <ResponsiveCountryComparisonBar 
              data={data}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
          />
        </div>
        
        <div className="comparison-item">
          <p className="text-sm font-semibold font-[Helvetica] ml-5 mt-2">Consumption of renewable energy</p>
          <ResponsiveCountryComparisonRenewablesBar 
            data={data}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry} />
        </div>
          <div className="comparison-item">
          <p className="text-sm font-semibold font-[Helvetica] ml-5 mt-2">Renewable share of total</p>
          <ResponsiveRenewableEnergyStackedBar
            data={data}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
          />
        </div>
      </div>

      <p className="text-base ml-5 mt-6 mb-4 pr-4 text-black">
        China also leads in renewable energy consumption. Though renewables represented just 17% of China's energy mix in 2024, China's total consumption was so high that its renewables alone equal 1.8 times Japan's total energy use. This shows the scale of China's domestic renewable capacity. Brazil ranks third in renewable consumption, with nearly half its energy use sourced by renewables.
      </p>

      <div className="footer">
      <p className="text-[10px] text-gray-600"><i>A D3 loves React project</i></p>
      <p className="text-[10px] text-gray-600 -mt-2 mb-5"><i>Rachel Wilson</i></p>
      </div>

      
      
      
    </>
  )
}

export default App
