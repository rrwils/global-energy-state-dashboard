import * as d3 from 'd3';

const tickLength = 6;

export const AxisLeftBand = ({ yScale, label, boundsWidth }) => {
    const range = yScale.range();
    const height = range[1] - range[0];
    
    // Get the domain (category names) from the band scale
    const domain = yScale.domain();

    return (
        <>
            {/* Main vertical line */}
            <path 
                d={['M', 0, range[0], 'L', 0, range[1]].join(' ')}
                stroke="#474747"
                fill="none"
            />

            {/* Ticks and labels for each category */}
            {domain.map((value) => (
                <g key={value} transform={`translate(0, ${yScale(value) + yScale.bandwidth() / 2})`}>

                    {/* Horizontal grid lines */}
                    {/* <line 
                        x1={0}
                        x2={boundsWidth}
                        stroke="#919191"
                        opacity={0.3}
                        strokeWidth={0.5}
                    /> */}

                    {/* <line x2={-tickLength} stroke="#474747" /> */}
                    <text 
                        x={-8}
                        style={{
                            fontSize: '10px',
                            textAnchor: 'end',
                        }}
                        dy="0.32em"
                    >
                        {value === 'United States' ? 'US' : value === 'United Kingdom' ? 'UK' : value === 'United Arab Emirates' ? 'UAE' : value}
                    </text>
                </g>  
            ))}

            {/* Axis label */}
            {label && (
                <text
                    x={-height / 2}
                    y={-45}
                    fontSize={12}
                    textAnchor="middle"
                    transform="rotate(-90)"
                >
                    {label}
                </text>
            )}
        </>
    )
}
