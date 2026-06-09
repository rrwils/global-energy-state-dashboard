import * as d3 from 'd3';
import { data } from './data.js';
import { useRef, useState } from 'react';
import { useDimensions } from './use-dimensions.js';
import { AxisBottom } from './AxisBottom.jsx';
import { AxisLeft } from './AxisLeft.jsx';

export const ResponsiveRenewableLines = (props) => {
    const chartRef = useRef(null);
    const chartSize = useDimensions(chartRef);

    return (
        <div ref={chartRef} style={{ width: '100%', height: 400 }}>
            <RenewableLines width={chartSize.width} height={chartSize.height} {...props} />
        </div>
    );
};

export const RenewableLines = ({ width, height, data, highlightedRenewable = null }) => {

    const [tooltip, setTooltip] = useState(null);

    const margin = { top: 20, right: 50, bottom: 40, left: 80 };

    const boundsWidth = width - margin.left - margin.right;
    const boundsHeight = height - margin.top - margin.bottom;

    const worldRenewables = data
        .filter(d => d.country === 'World')
    
    const worldRenewables2024 = worldRenewables.find(d => d.year === 2024);
    const energyTypes = ['hydro', 'wind', 'solar', 'biofuel', 'other_renewable'];

    const xScale = d3.scaleLinear()
        .domain(d3.extent(worldRenewables, d => d.year))
        .range([0, boundsWidth]);

    const yScale = d3.scaleLinear()
        .domain([0, 
            d3.max(worldRenewables, d => d3.max(energyTypes, type => d[type]))
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

    const lineGenerator = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.value));

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
        const yearData = worldRenewables.find(d => d.year === year);

        if (yearData) {
            setTooltip({ x, y, year, yearData });
        }
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };

    return(
        <svg width={width} height={height} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <g transform={`translate(${margin.left}, ${margin.top})`}>

                {/* Generate a line for each energy type */}
                <g className="line-container">
                    {energyTypes.map(type => {
                        const lineData = worldRenewables
                            .map(d => ({
                                year: d.year,
                                value: d[type]
                            }));

                        const isHighlighted = highlightedRenewable === type;
                        const isDimmed = highlightedRenewable && type !== highlightedRenewable;

                        return (
                            <path 
                                key={type}
                                d={lineGenerator(lineData)}
                                fill="none"
                                stroke={colorScale(type)}
                                strokeWidth={isHighlighted ? 2.75 : 2}
                                className="lineItem"
                                style={
                                    highlightedRenewable
                                        ? { opacity: isDimmed ? 0.22 : 1 }
                                        : undefined
                                }
                            />
                        );
                    })}
                </g>
                

                <rect 
                    width={boundsWidth}
                    height={boundsHeight}
                    fill="none"
                    pointerEvents="none" 
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
                    </>
                )}

                {/* Generate a circle for the 2024 values */}
                {energyTypes.map(type => {
                    const value2024 = worldRenewables2024[type];

                    const sentenceCase = (str) => {
                        return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
                    };

                    const isHighlighted = highlightedRenewable === type;
                    const isDimmed = highlightedRenewable && type !== highlightedRenewable;

                    return (
                        <>
                            <circle 
                                key={type}
                                cx={xScale(2024)}
                                cy={yScale(value2024)}
                                r={isHighlighted ? 4 : 3}
                                fill={colorScale(type)}
                                opacity={isDimmed ? 0.2 : 1}
                            />

                            <text
                                key={`${type}-label`}
                                x={xScale(2024) + 5}
                                y={yScale(value2024)}
                                fontSize="11px"
                                fill={type === 'solar' ? '#e8b131' : colorScale(type)}
                                alignmentBaseline="start"
                                opacity={isDimmed ? 0.2 : 1}
                                fontWeight={isHighlighted ? 700 : 400}
                            >
                                {`${type === "other_renewable" ? "Other" : sentenceCase(type)}`}
                            </text>
                        </>
                        

                    );
                })}

                
                


                <g transform={`translate(0, ${boundsHeight})`}>
                    <AxisBottom xScale={xScale} pixelsPerTick={70} boundsHeight={boundsHeight} />
                </g>
                
                    <AxisLeft yScale={yScale} pixelsPerTick={50} boundsWidth={boundsWidth} />
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

