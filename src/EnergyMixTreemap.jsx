import * as d3 from 'd3';
import { useRef, useState } from 'react';
import { useDimensions } from './use-dimensions.js';
import { data } from './data.js';

const colors = {
    fossilFuels: '#704e24',
    renewables: '#3e9e6b',
    other: '#f2c957'
};

export const ResponsiveEnergyMixTreemap = (props) => {
    const chartRef = useRef(null);
    const chartSize = useDimensions(chartRef);
    console.log('ResponsiveEnergyMixTreemap rendering with chartSize:', chartSize);

    return (
        <div ref={chartRef} style={{ width: '100%', height: 400 }}>
            <EnergyMixTreemap width={chartSize.width} height={chartSize.height} {...props} />
        </div>
    );
};

export const EnergyMixTreemap = ({ width, height, data }) => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    console.log('EnergyMixTreemap rendering with width:', width, 'height:', height);

    const margin = { top: 20, right: 10, bottom: 30, left: 18 };
    const boundsWidth = width - margin.left - margin.right;
    const boundsHeight = height - margin.top - margin.bottom;

    // Get World data for multiple years
    const selectedYears = [1965, 2000, 2024];
    const worldData = data
        .filter(d => d.country === 'World' &&
            selectedYears.includes(d.year)
        );

    // Build hierarchical data structure
    const hierarchyData = {
        name: 'Energy Mix',
        children: worldData.map(d => ({
            year: d.year,
            children: [
                { name: 'Fossil Fuels', value: (d.coal + d.oil + d.gas) },
                { name: 'Renewables', value: (d.hydro + d.wind + d.solar + d.biofuel + d.other_renewable) },
                { name: 'Other', value: (d.primary_energy - (d.coal + d.oil + d.gas + d.hydro + d.wind + d.solar + d.biofuel + d.other_renewable)) }
            ]
        }))
        .sort((a, b) => a.year - b.year)
    };

    const percentageData = worldData.map(d => ({
        year: d.year,
        fossilFuels: (d.coal + d.oil + d.gas) / d.primary_energy * 100,
        renewables: (d.hydro + d.wind + d.solar + d.biofuel + d.other_renewable) / d.primary_energy * 100,
        other: (d.primary_energy - (d.coal + d.oil + d.gas + d.hydro + d.wind + d.solar + d.biofuel + d.other_renewable)) / d.primary_energy * 100
    }))
    .sort((a, b) => a.year - b.year);

    // Create treemap layout
    const treemapLayout = d3.treemap()
        .size([boundsWidth, boundsHeight])
        .paddingTop(20)
        .paddingRight(10)
        .paddingBottom(5)
        .paddingLeft(2);

    const hierarchy = d3.hierarchy(hierarchyData)
        .sum(d => d.value)
        .sort((a, b) => a.data.year - b.data.year);

    const treemapRoot = treemapLayout(hierarchy);

    const yearGroups = treemapRoot.leaves().map(node => ({
        x: node.x0,
        y: node.y0,
        width: node.x1 - node.x0,
        height: node.y1 - node.y0,
        name: node.data.name,
        parent: node.parent.data.name,
        value: node.data.value
    }));

    const categoryColor = (name) => {
        if (name.includes('Fossil Fuels')) return colors.fossilFuels;
        if (name.includes('Renewables')) return colors.renewables;
        return colors.other;
    };

    return (
        <svg width={width} height={height}>
            <g transform={`translate(${margin.left}, ${margin.top})`}>
                {/* Legend */}
                <g transform={`translate(6, -10)`}>
                    <g
                        onMouseEnter={() => setSelectedCategory('Fossil Fuels')}
                        onMouseLeave={() => setSelectedCategory(null)}
                        style={{ cursor: 'pointer' }}
                    >
                        <rect x={0} y={0} width={12} height={12} fill={colors.fossilFuels} />
                        <text x={16} y={10} fontSize="12px">Fossil Fuels</text>
                    </g>

                    <g
                        onMouseEnter={() => setSelectedCategory('Renewables')}
                        onMouseLeave={() => setSelectedCategory(null)}
                        style={{ cursor: 'pointer' }}
                    >
                        <rect x={100} y={0} width={12} height={12} fill={colors.renewables} />
                        <text x={116} y={10} fontSize="12px">Renewables</text>
                    </g>

                    <g
                        onMouseEnter={() => setSelectedCategory('Other')}
                        onMouseLeave={() => setSelectedCategory(null)}
                        style={{ cursor: 'pointer' }}
                    >
                        <rect x={200} y={0} width={12} height={12} fill={colors.other} />
                        <text x={216} y={10} fontSize="12px">Other</text>
                    </g>
                </g>

                {/* Year groups */}
                {treemapRoot.children && treemapRoot.children.map(node => {
                    const yearX = node.x0;
                    const yearY = node.y0;
                    const yearWidth = node.x1 - node.x0;
                    const yearHeight = node.y1 - node.y0;

                    return (
                        <g key={node.data.name}>
                            {/* Energy mix rectangles */}
                            {node.children && node.children.map(child => {
                                const rectMargin = 1;
                                return (
                                    <rect
                                        key={child.data.name}
                                        x={child.x0 + rectMargin}
                                        y={child.y0 + rectMargin}
                                        width={Math.max(0, child.x1 - child.x0 - 2 * rectMargin)}
                                        height={Math.max(0, child.y1 - child.y0 - 2 * rectMargin)}
                                        fill={categoryColor(child.data.name)}
                                        stroke={selectedCategory === child.data.name ? 'black' : 'white'}
                                        strokeWidth={selectedCategory === child.data.name ? 1.5 : 1}
                                        opacity="1"
                                    >
                                        <title>{`${child.data.name}: ${child.data.value.toFixed(1)}`}</title>
                                    </rect>
                                );
                            })}
                        </g>
                    );
                })}

                {/* Year labels */}
                {treemapRoot.children && treemapRoot.children.map(node => {
                    const yearX = node.x0 + 3;
                    const yearY = node.y0;
                    const yearWidth = node.x1 - node.x0;
                    const yearHeight = node.y1 - node.y0;

                    return (
                        <g key={`label-${node.data.year}`}>
                            <text
                                x={yearX}
                                y={yearY + 12}
                                fontSize="14px"
                                fontWeight="bold"
                                fill="#000"
                                pointerEvents="none"
                                dominantBaseline="middle"
                            >
                                {node.data.year}
                            </text>
                        </g>
                    );
                })}

                {/* Add percentage labels */}
                {treemapRoot.leaves().map(node => {
                    const category = node.data.name;
                    const year = node.parent.data.year;
                    const percentageInfo = percentageData.find(d => d.year === year);
                    let percentageValue = 0;
                    if (category.includes('Fossil Fuels')) percentageValue = percentageInfo.fossilFuels;
                    else if (category.includes('Renewables')) percentageValue = percentageInfo.renewables;
                    else percentageValue = percentageInfo.other;
                    const amountInfo = node.data.value;

                    return (
                        <text
                            key={`percentage-${node.data.name}`}
                            x={node.x0 + (node.x1 - node.x0) / 2}
                            y={category === 'Other' ? node.y1 + 14 : node.y0 + (node.y1 - node.y0) / 2 }
                            fontSize={selectedCategory === category ? '14px' : '12px'}
                            fontFamily="Helvetica"
                            fill={category === 'Fossil Fuels' ? '#fff' : '#000'}
                            fontWeight={600}
                            pointerEvents="none"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            opacity={selectedCategory === category && category === 'Other' ? 1 : 
                                selectedCategory === category && category === 'Renewables' ? 1 :
                                category === 'Other' || category === 'Renewables' && year !== 2024 ? 0 : 1}
                        >
                            <tspan x={node.x0 + (node.x1 - node.x0) / 2} dy="-0.45em">
                                {d3.format('.3s')(amountInfo)} TWh
                            </tspan>
                            <tspan x={node.x0 + (node.x1 - node.x0) / 2} dy="1.2em">
                                {`${percentageValue.toFixed(0)}%`}
                            </tspan>
                        </text>
                    );
                })}

                
            </g>
        </svg>
    );
}