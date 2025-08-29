
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';
import { StockDataPoint, ChartTimeRange, MarketEvent } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface StockChartProps {
  data: StockDataPoint[];
  symbol: string;
  timeRange: ChartTimeRange;
  setTimeRange: (range: ChartTimeRange) => void;
  color?: string;
  events?: MarketEvent[]; // Optional events to mark on the chart
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-700 p-3 rounded shadow-lg border border-neutral-600">
        <p className="text-sm text-neutral-200">{`Date: ${label}`}</p>
        <p className="text-sm" style={{ color: payload[0].stroke }}>{`Price: $${payload[0].value.toFixed(2)}`}</p>
        {payload[0].payload.volume && <p className="text-xs text-neutral-400">{`Volume: ${payload[0].payload.volume.toLocaleString()}`}</p>}
      </div>
    );
  }
  return null;
};

export const StockChart: React.FC<StockChartProps> = ({ data, symbol, timeRange, setTimeRange, color = "#3b82f6", events }) => {
  if (!data || data.length === 0) {
    return <Card className="h-96 flex items-center justify-center"><p className="text-neutral-400">No data available for {symbol}.</p></Card>;
  }
  
  const yDomain: [number, number] = [Math.min(...data.map(p => p.price)) * 0.95, Math.max(...data.map(p => p.price)) * 1.05];

  return (
    <Card className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-neutral-100">{symbol} Price Chart</h4>
        <div className="flex space-x-1">
          {Object.values(ChartTimeRange).map(range => (
            <Button
              key={range}
              variant={timeRange === range ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} stroke="#404040" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#a3a3a3' }}  />
            <YAxis domain={yDomain} tickFormatter={(value) => `$${value.toFixed(0)}`} tick={{ fontSize: 12, fill: '#a3a3a3' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <Line type="monotone" dataKey="price" stroke={color} strokeWidth={2} dot={false} name={symbol} />
            {events && events.filter(event => event.affectedStocks.includes(symbol)).map(event => {
                // Find the data point closest to the event date for ReferenceArea positioning
                // This is a simplified approach. A more robust solution would map dates properly.
                const eventDate = new Date(event.date);
                const dataPointForEvent = data.find(dp => new Date(dp.date) >= eventDate);
                if(dataPointForEvent) {
                    return (
                         <ReferenceArea 
                            key={event.id} 
                            x1={dataPointForEvent.date} 
                            x2={dataPointForEvent.date} // Make it a vertical line essentially
                            stroke="red" 
                            strokeOpacity={0.5}
                            label={{ value: event.title.substring(0,10)+'...', position: 'insideTopRight', fill: '#f87171', fontSize: 10 }} 
                         />
                    )
                }
                return null;
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
