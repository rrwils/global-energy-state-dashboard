import * as d3 from 'd3';

const tickLength = 6;

export const AxisBottom = ({ xScale, pixelsPerTick, label, boundsHeight }) => {
    const range = xScale.range();

    const width = range[1] - range[0];
    const numberOfTicksTarget = Math.max(2, Math.floor(width / pixelsPerTick));
    // const formatTick = d3.format('~s');
    const tickCandidates = xScale.ticks(numberOfTicksTarget);
    const seen = new Set();
    const tickValues = tickCandidates.filter((value) => {
        const label = value;
        if (seen.has(label)) return false;
        seen.add(label);
        return true;
    });

    return (
        <>
            {/* Main horizontal line */}
            <line 
             x1={range[0]}
             y1={0}
             x2={range[1]}
             y2={0}
            stroke="#474747"
            fill="none"
            />


            {/* Ticks and labels */}
            {tickValues.map((value) => (
                <g key={value} transform={`translate(${xScale(value)}, 0)`}>

                    {/* Vertical grid lines */}
                    {/* <line 
                        y1={0}
                        y2={-boundsHeight}
                        stroke="#919191"
                        opacity={0.3}
                        strokeWidth={0.5}
                    /> */}

                    <line y2={tickLength} stroke="black" />
                    <text 
                        key={value}
                        style={{
                            fontSize: '10px',
                            textAnchor: 'middle',
                            transform: 'translateY(20px)',
                        }}
                    >
                        {value}
                    </text>
                </g>  
            ))}

            {/* Axis label */}
            {label && (
                <text
                    x={width / 2}
                    y={45}
                    textAnchor="middle"
                    style={{ fontSize: '12px' }}
                >
                    {label}
                </text>
            )}
        </>
    )
}