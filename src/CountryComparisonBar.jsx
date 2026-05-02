import * as d3 from 'd3';
import { useRef } from 'react';
import { useDimensions } from './use-dimensions.js';
import { data } from './data.js';
import { AxisLeftBand } from './AxisLeftBand.jsx';
import { AxisBottom } from './AxisBottomAlt.jsx';

export const ResponsiveCountryComparisonBar = (props) => {
    const chartRef = useRef(null);
    const chartSize = useDimensions(chartRef);

    return (
        <div ref={chartRef} style={{ width: '100%', height: 400 }}>
            <CountryComparisonBar width={chartSize.width} height={chartSize.height} data={data} {...props} />
        </div>
    );
};
    

export const CountryComparisonBar = ({ width, height, data, selectedCountry, setSelectedCountry }) => {

    const margin = { top: 30, right: 30, bottom: 30, left: 80 };

    const boundsWidth = width - margin.left - margin.right;
    const boundsHeight = height - margin.top - margin.bottom;

    const country2024Data = data.filter(d => d.country !== 'World' && d.year === 2024)
        .sort((a, b) => b.primary_energy - a.primary_energy)
        .slice(0, 20);

    const yScale = d3.scaleBand()
        .domain(country2024Data.map(d => d.country))
        .range([0, boundsHeight])
        .padding(0.2);

    const maxValue = d3.max(country2024Data, d => d.primary_energy);
    const xScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([0, boundsWidth]);

    return (
        <svg width={width} height={height}>
            <g transform={`translate(${margin.left}, ${margin.top})`}>
                <AxisLeftBand 
                    yScale={yScale} 
                    boundsWidth={boundsWidth} 
                />
                {country2024Data.map(d => {
                    return (
                        <g key={d.country}>
                            {/* Invisible rect for hover interaction */}
                            <rect 
                            />
                            <rect 
                                x={0}
                                y={yScale(d.country) - yScale.bandwidth() * 0.25}
                                width={boundsWidth}
                                height={yScale.bandwidth() * 1.5}
                                fill="transparent"
                                pointerEvents="all"
                                onMouseEnter={() => setSelectedCountry(d.country)}
                                onMouseLeave={() => setSelectedCountry === null}
                                
                            />
                            <rect 
                                x={0}
                                y={yScale(d.country)}
                                width={Math.max(0, xScale(d.primary_energy))}
                                height={yScale.bandwidth()}
                                fill="#9b9e9b"
                                opacity={
                                    selectedCountry === null ? 1
                                    : selectedCountry === d.country ? 1 : 0.2
                                }
                                pointerEvents="none"
                            />
                        </g>
                    
                    
                    );
                })}
            </g>
            <g transform={`translate(${margin.left}, ${margin.top})`}>
                <AxisBottom 
                xScale={xScale} 
                boundsHeight={boundsHeight} 
                margin={margin}
                pixelsPerTick={80}
            />
            </g>
            

        </svg>

    );
}