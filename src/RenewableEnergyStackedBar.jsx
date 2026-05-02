import * as d3 from 'd3';
import { useRef } from 'react';
import { useDimensions } from './use-dimensions.js';
import { data } from './data.js';
import { AxisLeftBand } from './AxisLeftBand.jsx';
import { AxisBottom } from './AxisBottomPercent.jsx';

export const ResponsiveRenewableEnergyStackedBar = (props) => {
    const chartRef = useRef(null);
    const chartSize = useDimensions(chartRef);

    return (
        <div ref={chartRef} style ={{ width: '100%', height: 400 }}>
            <RenewableEnergyStackedBar 
                width={chartSize.width} 
                height={chartSize.height} 
                {...props} 
            />
        </div>
    )
}

export const RenewableEnergyStackedBar = ({ width, height, data, selectedCountry, setSelectedCountry }) => {
    const margin = { top: 30, right: 30, bottom: 30, left: 80 };

    const boundsWidth = width - margin.left - margin.right;
    const boundsHeight = height - margin.top - margin.bottom;

    const country2024data = data
        .filter(d => d.country !== 'World' && d.year === 2024)
        .sort((a, b) => b.primary_energy - a.primary_energy)
        .slice(0, 20);

    const renewablesData = country2024data.map(d => ({
        country: d.country,
        renewables: (d.hydro + d.wind + d.solar + d.biofuel + d.other_renewable) * 100 / d.primary_energy,
    }))
        .map(d => ({
            ...d,
            nonRenewables: Math.max(0, 100 - d.renewables)
        }))
        .sort((a, b) => b.renewables - a.renewables);

    const yScale = d3.scaleBand()
        .domain(renewablesData.map(d => d.country))
        .range([0, boundsHeight])
        .padding(0.2);

    const xScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, boundsWidth]);

    return (
        <svg width={width} height={height}>
            
            <g transform={`translate(${margin.left}, ${margin.top})`}>
                <AxisLeftBand 
                    yScale={yScale} 
                    boundsWidth={boundsWidth} 
                />
                <AxisBottom 
                xScale={xScale} 
                boundsHeight={boundsHeight} 
                margin={margin}
                pixelsPerTick={50}
                />
                {renewablesData.map(d => {
                    return (
                        <g key={d.country}>
                            {/* Invisible rect for hover interaction - full width for better UX */}
                            <rect 
                                x={0}
                                y={yScale(d.country) - yScale.bandwidth() * 0.25}
                                width={boundsWidth}
                                height={yScale.bandwidth() * 1.5}
                                fill="transparent"
                                pointerEvents="all"
                                onMouseEnter={() => setSelectedCountry(d.country)}
                                onMouseLeave={() => setSelectedCountry(null)}
                            />
                            <rect 
                                x={0}
                                y={yScale(d.country)}
                                width={Math.max(0, xScale(d.renewables))}
                                height={yScale.bandwidth()}
                                fill="#3e9e6b"
                                pointerEvents="none"
                                opacity={
                                    selectedCountry === null ? 1
                                    : selectedCountry === d.country ?
                                    1 : 0.2
                                }
                            />
                            <rect 
                                x={xScale(d.renewables)}
                                y={yScale(d.country)}
                                width={Math.max(0, xScale(d.nonRenewables))}
                                height={yScale.bandwidth()}
                                fill="#dbdbdb"
                                pointerEvents="none"
                                opacity={
                                    selectedCountry === null ? 1
                                    : selectedCountry === d.country ?
                                    1 : 0.2
                                }
                            />
                        </g>
                    
                    );
                })}
            </g>

            
        </svg>

    );
};