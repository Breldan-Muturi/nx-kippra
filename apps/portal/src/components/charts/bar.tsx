'use client';
import { formatValue } from '@/lib/utils';
import { BarDatum, ResponsiveBar } from '@nivo/bar';
import { Card } from '../ui/card';

const Bar = ({ data, keys }: { data: BarDatum[]; keys: string[] }) => (
  <ResponsiveBar
    data={data}
    keys={keys}
    indexBy="month"
    margin={{ top: 20, right: 130, bottom: 60, left: 80 }}
    padding={0.3}
    valueScale={{ type: 'linear' }}
    indexScale={{ type: 'band', round: true }}
    colors={{ scheme: 'yellow_green' }}
    defs={[
      {
        id: 'dots',
        type: 'patternDots',
        background: 'inherit',
        color: '#38bcb2',
        size: 4,
        padding: 1,
        stagger: true,
      },
      {
        id: 'lines',
        type: 'patternLines',
        background: 'inherit',
        color: '#eed312',
        rotation: -45,
        lineWidth: 6,
        spacing: 10,
      },
    ]}
    fill={[
      {
        match: {
          id: 'fries',
        },
        id: 'dots',
      },
      {
        match: {
          id: 'sandwich',
        },
        id: 'lines',
      },
    ]}
    borderColor={{
      from: 'color',
      modifiers: [['darker', 1.6]],
    }}
    axisTop={null}
    axisRight={null}
    axisBottom={{
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: 'Months of the year',
      legendPosition: 'middle',
      legendOffset: 48,
      truncateTickAt: 0,
    }}
    axisLeft={{
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: 'Monthly revenues',
      legendPosition: 'middle',
      legendOffset: -60,
      truncateTickAt: 0,
      format: formatValue,
    }}
    labelSkipWidth={12}
    labelSkipHeight={12}
    labelTextColor={{
      from: 'color',
      modifiers: [['darker', 1.6]],
    }}
    valueFormat={formatValue}
    legends={[
      {
        dataFrom: 'keys',
        anchor: 'bottom-right',
        direction: 'column',
        justify: false,
        translateX: 120,
        translateY: 0,
        itemsSpacing: 2,
        itemWidth: 100,
        itemHeight: 20,
        itemDirection: 'left-to-right',
        itemOpacity: 0.85,
        symbolSize: 20,
        effects: [
          {
            on: 'hover',
            style: {
              itemOpacity: 1,
            },
          },
        ],
      },
    ]}
    tooltip={({ id, value, color, indexValue }) => (
      <Card className="flex items-center p-2 space-x-2 text-sm rounded-sm">
        <div
          className="rounded-full size-5"
          style={{ backgroundColor: color }}
        />
        <p>
          <span>{id}</span>
          {' - '}
          <span>{indexValue}</span>
          {': '}
          <strong>{value.toLocaleString('en-US')}</strong>
        </p>
      </Card>
    )}
    role="application"
    ariaLabel="Bar chart showing revenues per month distributed across different programs"
    barAriaLabel={(e) =>
      e.id + ': ' + e.formattedValue + ' in month: ' + e.indexValue
    }
  />
);

export default Bar;
