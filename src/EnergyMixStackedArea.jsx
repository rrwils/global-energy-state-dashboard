import * as d3 from 'd3';
import { useRef, useState } from 'react';
import { useDimensions } from './use-dimensions.js';
import { data } from './data.js';
import { AxisBottom } from './AxisBottom.jsx';
import { AxisLeft } from './AxisLeft.jsx';

export const ResponsiveEnergyMixStackedArea = (props) => {
    const chartRef = useRef(null);
    const chartSize = useDimensions(chartRef);
    console.log('ResponsiveEnergyMixStackedArea rendering with chartSize:', chartSize);

    return (
        <div ref={chartRef} style={{ width: '100%', height: 400}}>
            <EnergyMixStackedArea width={chartSize.width} height={chartSize.height} {...props} />
        </div>
    );
};

export const EnergyMixStackedArea = ({ width, height, data, selectedEnergy = null }) => {

    const [tooltip, setTooltip] = useState(null);

    const margin = { top: 20, right: 30, bottom: 40, left: 80 };

    const boundsWidth = width - margin.left - margin.right;
    const boundsHeight = height - margin.top - margin.bottom;

    const worldData = data
        .filter(d => d.country === 'World');

    const allEnergyTypes = ['nuclear', 'hydro', 'wind', 'solar', 'biofuel', 'other_renewable', 'coal', 'oil', 'gas'];
    
    // Sort energy types by 2024 values in descending order
    const latestYear = d3.max(worldData, d => d.year);
    const latestData = worldData.find(d => d.year === latestYear);
    
    const energyTypes = allEnergyTypes.sort((a, b) => {
        const valueA = latestData[a] || 0;
        const valueB = latestData[b] || 0;
        return valueB - valueA;
    });
    
    const xScale = d3.scaleLinear()
        .domain(d3.extent(worldData, d => d.year))
        .range([0, boundsWidth]);

    const yScale = d3.scaleLinear()
        .domain([0,
            d3.max(worldData, d => d3.sum(energyTypes, type => d[type]))
        ])
        .nice()
        .range([boundsHeight, 0]);

    const energyTypeColors = {
        'coal': '#a1885a',           
        'oil': '#7f5a2e',            
        'gas': '#fdd49e',             
        'hydro': '#1f78b4',           
        'wind': '#66c2a5',            
        'solar': '#ffd92f',           
        'biofuel': '#a6d854',         
        'other_renewable': '#e5c494', 
        'nuclear': '#8da0cb'
    }
    
    const colorScale = d3.scaleOrdinal()
        .domain(energyTypes)
        .range(energyTypes.map(type => energyTypeColors[type]));

    const stackGenerator = d3.stack()
        .keys(energyTypes);
    
    const stackedData = stackGenerator(worldData);

    const areaGenerator = d3.area()
        .x(d => xScale(d.data.year))
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1]));

    const handleMouseMove = (e) => {
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const x = e.clientX - rect.left - margin.left;
        const y = e.clientY - rect.top - margin.top;

        if (x < 0 || x > boundsWidth || y < 0 || y > boundsHeight) {
            setTooltip(null);
            return;
        }

        const year = Math.round(xScale.invert(x));
        const yearData = worldData.find(d => d.year === year);

        if (yearData) {
            setTooltip({ x, y, year, yearData });
        }
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };

    return (
        <svg width={width} height={height} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <g transform={`translate(${margin.left}, ${margin.top})`}>

                {stackedData.map((layer, i) => {

                    const isNotSelected = selectedEnergy && layer.key !== selectedEnergy;
                    
                    return (
                        <path
                            key={i}
                            d={areaGenerator(layer)}
                            fill={colorScale(layer.key)}
                            style={
                                selectedEnergy
                                    ? { opacity: isNotSelected ? 0.2 : 1 }
                                    : undefined
                            }
                        />
                )})}

                {/* Overlay for mouse tracking */}
                <rect
                    width={boundsWidth}
                    height={boundsHeight}
                    fill="none"
                    pointerEvents="all"
                />

                {/* Crosshair lines */}
                {tooltip && (
                    <>
                        {/* Vertical crosshair line */}
                        <line
                            x1={tooltip.x}
                            y1={0}
                            x2={tooltip.x}
                            y2={boundsHeight}
                            stroke="#424242"
                            strokeWidth="1"
                            strokeDasharray="4,4"
                            pointerEvents="none"
                        />

                        {/* Horizontal crosshair line */}
                        {/* <line
                            x1={0}
                            y1={tooltip.y}
                            x2={boundsWidth}
                            y2={tooltip.y}
                            stroke="#424242"
                            strokeWidth="1"
                            strokeDasharray="4,4"
                            pointerEvents="none"
                        /> */}
                    </>
                )}

                <g transform={`translate(0, ${boundsHeight})`}>
                    <AxisBottom xScale={xScale} pixelsPerTick={70} boundsHeight={boundsHeight} />
                </g>

                <AxisLeft yScale={yScale} pixelsPerTick={60} boundsWidth={boundsWidth} />
            </g>

            {/* Tooltip */}
            {tooltip && (
                <g pointerEvents="none">
                    {(() => {
                        const tooltipWidth = 180;
                        const tooltipHeight = 25 + energyTypes.length * 18;
                        
                        // Calculate position with smart left/right placement
                        let offsetX = 10;
                        const tooltipXInSvg = margin.left + tooltip.x;
                        
                        if (tooltipXInSvg + offsetX + tooltipWidth > width) {
                            // Position to the left if too close to right edge
                            offsetX = -tooltipWidth - 10;
                        }
                        
                        // Calculate position with smart top/bottom placement
                        let offsetY = -10;
                        const tooltipYInSvg = margin.top + tooltip.y;
                        
                        if (tooltipYInSvg + offsetY - tooltipHeight < margin.top) {
                            // Position below if too close to top
                            offsetY = 10;
                        }
                        
                        return (
                            <g transform={`translate(${margin.left + tooltip.x + offsetX}, ${margin.top + tooltip.y + offsetY})`}>
                                {/* Background box */}
                                <rect
                                    x="0"
                                    y={offsetY < 0 ? -tooltipHeight : 0}
                                    width={tooltipWidth}
                                    height={tooltipHeight}
                                    fill="white"
                                    stroke="#333"
                                    strokeWidth="1"
                                    rx="4"
                                    opacity="1"
                                />

                                {/* Year text */}
                                <text
                                    x="8"
                                    y={offsetY < 0 ? -tooltipHeight + 15 : 15}
                                    fontSize="12"
                                    fontWeight="bold"
                                    fill="#333"
                                >
                                    {tooltip.year}
                                </text>

                                {/* Energy type rows */}
                                {energyTypes.map((type, i) => {
                                    const rowY = offsetY < 0 ? -tooltipHeight + 28 + i * 18 : 28 + i * 18;
                                    return (
                                        <g key={type} transform={`translate(0, ${rowY})`}>
                                            {/* Color circle */}
                                            <circle
                                                cx="8"
                                                cy="0"
                                                r="4"
                                                fill={colorScale(type)}
                                            />

                                            {/* Energy type label */}
                                            <text
                                                x="18"
                                                y="4"
                                                fontSize="11"
                                                fill="#333"
                                            >
                                                {type === "other_renewable" ? "other renewable" : type}: {d3.format('.3s')(tooltip.yearData[type] || 0)}
                                            </text>
                                        </g>
                                    );
                                })}
                            </g>
                        );
                    })()}
                </g>
            )}
        </svg>

    );
};
