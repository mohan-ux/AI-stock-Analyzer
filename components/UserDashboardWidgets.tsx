
import React, { useState } from 'react';
import { UserAlert, PortfolioItem, Company } from '../types';
import { AVAILABLE_STOCKS } from '../constants';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import { TrashIcon, PlusCircleIcon, AdjustmentsHorizontalIcon } from '../assets/icons';

// --- Watchlist ---
interface WatchlistProps {
  watchedStocks: Company[];
  onRemoveFromWatchlist: (symbol: string) => void;
  onAddToWatchlist: (symbol: string) => void;
  onSelectStock: (symbol: string) => void;
}

export const Watchlist: React.FC<WatchlistProps> = ({ watchedStocks, onRemoveFromWatchlist, onAddToWatchlist, onSelectStock }) => {
  const [selectedStockToAdd, setSelectedStockToAdd] = useState('');
  const stockOptions = AVAILABLE_STOCKS.filter(s => !watchedStocks.find(ws => ws.symbol === s.symbol)).map(s => ({ value: s.symbol, label: s.name }));

  return (
    <Card title="My Watchlist" icon={<AdjustmentsHorizontalIcon className="w-5 h-5" />}>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Select 
            options={stockOptions} 
            value={selectedStockToAdd}
            onChange={(e) => setSelectedStockToAdd(e.target.value)}
            placeholder="Add stock to watchlist"
            className="flex-grow"
          />
          <Button onClick={() => { if(selectedStockToAdd) { onAddToWatchlist(selectedStockToAdd); setSelectedStockToAdd('');}}} disabled={!selectedStockToAdd} size="md">Add</Button>
        </div>
        {watchedStocks.length > 0 ? (
          <ul className="space-y-2">
            {watchedStocks.map(stock => (
              <li key={stock.symbol} className="flex justify-between items-center p-2 bg-neutral-700 rounded">
                <span onClick={() => onSelectStock(stock.symbol)} className="cursor-pointer hover:text-primary-400">{stock.name} ({stock.symbol})</span>
                <Button variant="danger" size="sm" onClick={() => onRemoveFromWatchlist(stock.symbol)}><TrashIcon className="w-4 h-4"/></Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-neutral-400">Your watchlist is empty. Add stocks to track them here.</p>
        )}
      </CardContent>
    </Card>
  );
};

// --- Alerts ---
interface AlertsManagerProps {
  alerts: UserAlert[];
  onAddAlert: (alert: Omit<UserAlert, 'id' | 'isActive'>) => void;
  onRemoveAlert: (id: string) => void;
  onToggleAlert: (id: string) => void;
}

export const AlertsManager: React.FC<AlertsManagerProps> = ({ alerts, onAddAlert, onRemoveAlert, onToggleAlert }) => {
  // Simplified form for adding alerts
  const [newAlertStock, setNewAlertStock] = useState('');
  const [newAlertCondition, setNewAlertCondition] = useState<'price_above' | 'price_below'>('price_above');
  const [newAlertValue, setNewAlertValue] = useState('');

  const stockOptions = AVAILABLE_STOCKS.map(s => ({ value: s.symbol, label: s.name }));
  const conditionOptions = [
    { value: 'price_above', label: 'Price rises above' },
    { value: 'price_below', label: 'Price falls below' },
    // { value: 'sentiment_change', label: 'Sentiment changes to' } // More complex, omit for now
  ];

  const handleAddAlert = () => {
    if (newAlertStock && newAlertValue && !isNaN(parseFloat(newAlertValue))) {
      onAddAlert({ stockSymbol: newAlertStock, condition: newAlertCondition, targetValue: parseFloat(newAlertValue) });
      setNewAlertStock(''); setNewAlertValue('');
    } else {
      alert("Please fill all fields correctly for the alert.");
    }
  };

  return (
    <Card title="My Alerts" icon={<AdjustmentsHorizontalIcon className="w-5 h-5" />}>
      <CardContent>
        <div className="space-y-3 mb-6 p-3 bg-neutral-700 rounded">
          <h4 className="text-md font-semibold">Create New Alert</h4>
          <Select options={stockOptions} value={newAlertStock} onChange={e => setNewAlertStock(e.target.value)} placeholder="Select Stock" />
          <Select options={conditionOptions} value={newAlertCondition} onChange={e => setNewAlertCondition(e.target.value as any)} />
          <Input type="number" placeholder="Target Value (e.g., 150)" value={newAlertValue} onChange={e => setNewAlertValue(e.target.value)} />
          <Button onClick={handleAddAlert} className="w-full" leftIcon={<PlusCircleIcon className="w-5 h-5"/>}>Add Alert</Button>
        </div>
        {alerts.length > 0 ? (
          <ul className="space-y-2">
            {alerts.map(alert => (
              <li key={alert.id} className="flex justify-between items-center p-2 bg-neutral-700 rounded">
                <div>
                  <span className="font-semibold">{alert.stockSymbol}</span>: {alert.condition.replace('_', ' ')} {alert.targetValue}
                </div>
                <div className="flex items-center gap-2">
                   <Button variant={alert.isActive ? "primary" : "outline"} size="sm" onClick={() => onToggleAlert(alert.id)}>
                    {alert.isActive ? 'Active' : 'Inactive'}
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => onRemoveAlert(alert.id)}><TrashIcon className="w-4 h-4"/></Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-neutral-400">You have no active alerts.</p>
        )}
      </CardContent>
    </Card>
  );
};

// --- Portfolio Tracker ---
interface PortfolioTrackerProps {
  portfolio: PortfolioItem[];
  stocksInfo: Company[]; // To get current prices, simplified
  onAddItem: (item: Omit<PortfolioItem, 'purchaseDate'>) => void;
  onRemoveItem: (symbol: string) => void;
}
export const PortfolioTracker: React.FC<PortfolioTrackerProps> = ({ portfolio, stocksInfo, onAddItem, onRemoveItem }) => {
  const [newItemStock, setNewItemStock] = useState('');
  const [newItemShares, setNewItemShares] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  const stockOptions = AVAILABLE_STOCKS.map(s => ({ value: s.symbol, label: s.name }));

  const handleAddItem = () => {
    if(newItemStock && newItemShares && newItemPrice && !isNaN(parseFloat(newItemShares)) && !isNaN(parseFloat(newItemPrice))) {
      onAddItem({ stockSymbol: newItemStock, shares: parseFloat(newItemShares), purchasePrice: parseFloat(newItemPrice)});
      setNewItemStock(''); setNewItemShares(''); setNewItemPrice('');
    } else {
      alert("Please fill all fields correctly for the portfolio item.");
    }
  }

  const calculatePortfolioValue = () => {
    return portfolio.reduce((total, item) => {
      const stockInfo = stocksInfo.find(s => s.symbol === item.stockSymbol);
      // This is a simplification; real current price would be fetched dynamically
      const currentPrice = stockInfo?.peRatio ? stockInfo.peRatio * 7 : item.purchasePrice * (1 + (Math.random() - 0.5) * 0.2); // Mock current price
      return total + (item.shares * currentPrice);
    }, 0);
  };

  const totalValue = calculatePortfolioValue();

  return (
    <Card title="My Mock Portfolio" icon={<AdjustmentsHorizontalIcon className="w-5 h-5" />}>
      <CardContent>
         <div className="space-y-3 mb-6 p-3 bg-neutral-700 rounded">
          <h4 className="text-md font-semibold">Add to Portfolio</h4>
          <Select options={stockOptions} value={newItemStock} onChange={e => setNewItemStock(e.target.value)} placeholder="Select Stock" />
          <Input type="number" placeholder="Number of Shares" value={newItemShares} onChange={e => setNewItemShares(e.target.value)} />
          <Input type="number" placeholder="Purchase Price per Share" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} />
          <Button onClick={handleAddItem} className="w-full" leftIcon={<PlusCircleIcon className="w-5 h-5"/>}>Add Item</Button>
        </div>

        {portfolio.length > 0 ? (
          <>
            <div className="mb-4 text-lg">Total Portfolio Value (Mock): <span className="font-semibold text-primary-400">${totalValue.toFixed(2)}</span></div>
            <ul className="space-y-2">
              {portfolio.map(item => {
                const stockInfo = stocksInfo.find(s => s.symbol === item.stockSymbol);
                const currentPrice = stockInfo?.peRatio ? stockInfo.peRatio * 7 : item.purchasePrice * (1 + (Math.random() - 0.5) * 0.2); // Mock current price
                const value = item.shares * currentPrice;
                const gainLoss = value - (item.shares * item.purchasePrice);
                return (
                  <li key={item.stockSymbol} className="flex justify-between items-center p-3 bg-neutral-700 rounded">
                    <div>
                      <span className="font-semibold">{item.stockSymbol}</span> - {item.shares} shares @ ${item.purchasePrice.toFixed(2)}
                      <p className="text-xs text-neutral-400">Current Value: ${value.toFixed(2)} 
                        <span className={gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}> ({gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)})</span>
                      </p>
                    </div>
                    <Button variant="danger" size="sm" onClick={() => onRemoveItem(item.stockSymbol)}><TrashIcon className="w-4 h-4"/></Button>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <p className="text-neutral-400">Your portfolio is empty. Add items to track their performance.</p>
        )}
      </CardContent>
    </Card>
  );
};
