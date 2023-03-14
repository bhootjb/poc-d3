import * as d3 from 'd3';
import * as htl from 'htl';
import rawData from './data';

export const compress = (yearlyData) => {
    return {
        date: new Date(yearlyData.start),
        value: yearlyData.sequence.reduce((acc, curr) => acc + curr, 0),
    };
};
export const makeChartNode = (weatherData, threshold) => {
    const margin = ({top: 20, right: 30, bottom: 30, left: 40});
    const height = 240;
    const width = 640;

    const thresholdData = weatherData.map(wd => ({date: wd.date, value: threshold}));

    const x = d3
        .scaleUtc()
        .domain(d3.extent(weatherData, d => d.date))
        .range([margin.left, width - margin.right]);

    const y = d3
        .scaleLinear()
        .domain([0, d3.max(weatherData, d => d.value)])
        .range([height - margin.bottom, margin.top]);

    const line = d3
        .line()
        .x(d => x(d.date))
        .y(d => y(d.value));

    const xAxis = g => g
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .style('color', '#dcdcdc')
        .call(d3
            .axisBottom(x)
            .ticks(width / 80)
            .tickSize(-(height - margin.top - margin.bottom))
            .tickSizeOuter(0));

    const yAxis = g => g
        .attr('transform', `translate(${margin.left - 10}, 0)`)
        .style('color', '#dcdcdc')
        .call(d3
            .axisLeft(y)
            .ticks(height / 40)
            .tickSize(-(width - margin.left - margin.right))
            .tickSizeOuter(0));

    const onMouseMoveOnHistoricalWeatherDataCircle = (ev, d) => {
        d3.select('.tooltip')
            .style('opacity', 1)
            .style('left', `${ev.pageX}px`)
            .style('top', `${ev.pageY}px`)
            .html(`<dl>
                        <div>
                            <dt>Date:</dt>
                            <dd>${d.date.getFullYear()}</dd>
                        </div>
                        <div>
                            <dt>Value</dt>
                            <dd>${d.value}</dd>
                        </div>
                      </dl>`);
    };
    const onMouseMoveOnThresholdLine = ev => {
        // refs:
        // https://d3-graph-gallery.com/graph/line_cursor.html
        // https://observablehq.com/@d3/line-with-tooltip
        // https://github.com/d3/d3-array#bisectCenter
        // https://gramener.github.io/d3js-playbook/tooltips.html
        const xPosRelative = d3.pointer(ev)[0];
        const dateAtXPos = x.invert(xPosRelative);
        const dateArr = thresholdData.map(td => td.date).sort();
        const indexOfDataPointInThresholdDataSeriesClosestToDateAtXPos = d3.bisectCenter(dateArr, dateAtXPos);
        const dataPointInThresholdDataSeriesClosestToDateAtXPos = thresholdData[indexOfDataPointInThresholdDataSeriesClosestToDateAtXPos];
        if (dataPointInThresholdDataSeriesClosestToDateAtXPos) {
            d3.select('.tooltip')
                .style('opacity', 1)
                .style('left', `${ev.pageX}px`)
                .style('top', `${ev.pageY}px`)
                .html(`<dl>
                        <dt>Threshold:</dt>
                        <dd>${dataPointInThresholdDataSeriesClosestToDateAtXPos.value}</dd>
                   </dl>`);
        }
    };
    const onMouseOut = _ => {
        d3.select('.tooltip').style('opacity', 0);
    };

    return htl.svg`<svg viewBox='0 0 ${width} ${height}'>
      ${d3.select(htl.svg`<g>`).call(xAxis).node()}
      ${d3.select(htl.svg`<g>`).call(yAxis).node()}
      
      <path d='${line(weatherData)}' fill='none' stroke='#226398' stroke-width='1.5' stroke-miterlimit='1'></path>
      
      <path 
        d='${line(thresholdData)}' 
        fill='none' stroke='#d47024' 
        stroke-width='1.5' stroke-miterlimit='1'
        onmousemove=${onMouseMoveOnThresholdLine}
        onmouseout=${onMouseOut}></path>
        
      ${weatherData.map(d => htl.svg`<circle 
            cx='${x(d.date)}'
            cy='${y(d.value)}'
            r='3'
            fill='#226398'
            onmousemove=${(ev) => onMouseMoveOnHistoricalWeatherDataCircle(ev, d)}
            onmouseout=${onMouseOut}>`)}  
    </svg>`;
};
document.addEventListener('DOMContentLoaded', () => {
    const data = rawData.map(rd => compress(rd));
    const chart = makeChartNode(data, 70);
    const ele = document.getElementById('chart');
    ele.appendChild(chart);
});
