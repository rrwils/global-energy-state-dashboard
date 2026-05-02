import * as d3 from 'd3';

const tickLength = 6;

export const AxisLeft = ({ yScale, pixelsPerTick, label, boundsWidth }) => {
    const range = yScale.range();

    const height = range[0] - range[1];
    const numberOfTicksTarget = Math.floor(height / pixelsPerTick);
    

    return (
        <>
            {/* Main vertical line */}
            <path 
                d={['M', 0, range[0], 'L', 0, range[1]].join(' ')}
                stroke="#474747"
                fill="none"
            />

            {/* Ticks and labels */}
            {yScale.ticks(numberOfTicksTarget).map((value) => (
                <g key={value} transform={`translate(0, ${yScale(value)})`}>

                    {/* Horizontal grid lines */}
                    <line 
                        x1={0}
                        x2={boundsWidth}
                        stroke="#919191"
                        opacity={0.3}
                        strokeWidth={0.5}
                    />

                    <line x2={-tickLength} stroke="black" />
                    <text 
                        style={{
                            fontSize: '10px',
                            textAnchor: 'end',
                            transform: 'translateX(-10px)',
                        }}
                        dy="0.32em"
                    >
                        {value === 0 ? '0'
                         : value === 2000 ? '2k'
                         : value === 4000 ? '4k'
                         : value === 6000 ? '6k'
                         : value === 8000 ? '8k'
                         : d3.format('.2s')(value)} TWh
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