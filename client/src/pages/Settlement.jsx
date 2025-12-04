import React, { useState } from 'react';

const SettlementPage = () => {
  // Mock Data: This represents the output of your "Min-Cash Flow" algorithm
  // Scenario: The current user is 'u1' (You)
  const currentUser = { id: 'u1', name: 'You' };
  
  const [settlements, setSettlements] = useState([
    { id: 1, from: 'u2', fromName: 'Sarah', to: 'u1', toName: 'You', amount: 150, currency: '$', status: 'pending' },
    { id: 2, from: 'u1', fromName: 'You', to: 'u3', toName: 'Mike', amount: 45, currency: '$', status: 'pending' },
    { id: 3, from: 'u4', fromName: 'Emma', to: 'u1', toName: 'You', amount: 20, currency: '$', status: 'settled' },
  ]);

  // specific logic to calculate totals for the dashboard
  const calculateTotals = () => {
    let toReceive = 0;
    let toPay = 0;

    settlements.forEach(tx => {
      if (tx.status === 'pending') {
        if (tx.to === currentUser.id) toReceive += tx.amount;
        if (tx.from === currentUser.id) toPay += tx.amount;
      }
    });
    return { toReceive, toPay };
  };

  const { toReceive, toPay } = calculateTotals();

  // Handler to mark a debt as paid
  const handleSettle = (id) => {
    setSettlements(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'settled' } : item
    ));
  };

  return (
    <div className="settlement-container">
      {/* 1. Header */}
      <header className="page-header">
        <h1>Settlement & Debts</h1>
        <p>Simplified plan to clear all trip costs.</p>
      </header>

      {/* 2. Dashboard Cards */}
      <div className="balance-dashboard">
        <div className="balance-card green">
          <span className="label">To Receive</span>
          <span className="amount">+${toReceive}</span>
        </div>
        <div className="balance-card red">
          <span className="label">To Pay</span>
          <span className="amount">-${toPay}</span>
        </div>
      </div>

      {/* 3. The List of Transfers */}
      <div className="transfers-list">
        <h3>Suggested Transfers</h3>
        
        {settlements.map((tx) => (
          <div key={tx.id} className={`transfer-card ${tx.status}`}>
            
            {/* Left Node: Sender */}
            <div className="user-node">
              <div className="avatar sender">{tx.fromName.charAt(0)}</div>
              <span className="name">{tx.fromName}</span>
            </div>

            {/* Middle: Directional Flow */}
            <div className="flow-indicator">
              <span className="amount-pill">{tx.currency}{tx.amount}</span>
              <div className="arrow-line">
                <div className="arrow-head"></div>
              </div>
              <span className="status-text">
                {tx.status === 'settled' ? 'SETTLED' : 'OWES'}
              </span>
            </div>

            {/* Right Node: Receiver */}
            <div className="user-node">
              <div className="avatar receiver">{tx.toName.charAt(0)}</div>
              <span className="name">{tx.toName}</span>
            </div>

            {/* Actions: Buttons or Badges */}
            <div className="card-actions">
              {tx.status === 'pending' ? (
                tx.from === currentUser.id ? (
                  <button className="btn-pay" onClick={() => handleSettle(tx.id)}>
                    Mark Paid
                  </button>
                ) : (
                  <button className="btn-remind">
                    Remind
                  </button>
                )
              ) : (
                <div className="settled-badge">✓</div>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default SettlementPage;