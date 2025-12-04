import { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { calculateBalances, simplifyDebts } from '../lib/expenseSplitter';
import Button from '../components/Button';

export default function Settlement({ trip }) {
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [balances, setBalances] = useState({});

  useEffect(() => {
    loadData();
  }, [trip.id]);

  const loadData = async () => {
    const { data: membersData } = await supabase
      .from('trip_members')
      .select('*')
      .eq('trip_id', trip.id);

    const { data: expensesData } = await supabase
      .from('expenses')
      .select(`
        *,
        participants:expense_participants(*)
      `)
      .eq('trip_id', trip.id);

    if (membersData && expensesData) {
      setMembers(membersData);
      setExpenses(expensesData);

      const calculatedBalances = calculateBalances(expensesData, membersData);
      setBalances(calculatedBalances);

      const simplifiedTransactions = simplifyDebts(calculatedBalances, membersData);
      setTransactions(simplifiedTransactions);
    }
  };

  const getMemberName = (userId) => {
    const member = members.find(m => m.user_id === userId);
    return member ? member.name : 'Unknown';
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Settlement Summary</h2>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total Trip Expenses</h3>
              <p className="text-sm text-gray-600 mt-1">
                Split among {members.length} members
              </p>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              ${totalExpenses.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Individual Balances</h3>
            <div className="space-y-3">
              {members.map((member) => {
                const balance = balances[member.user_id] || 0;
                const isPositive = balance > 0;
                const isSettled = Math.abs(balance) < 0.01;

                return (
                  <div key={member.user_id} className="flex justify-between items-center">
                    <span className="text-gray-700">{member.name}</span>
                    <span
                      className={`font-semibold ${
                        isSettled
                          ? 'text-green-600'
                          : isPositive
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {isSettled ? (
                        <span className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Settled
                        </span>
                      ) : (
                        `${isPositive ? '+' : ''}$${balance.toFixed(2)}`
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Per Person Average</h3>
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900">
                ${(totalExpenses / members.length).toFixed(2)}
              </div>
              <p className="text-sm text-gray-600 mt-2">per person</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Simplified Settlements
            </h3>
            <span className="text-sm text-gray-600">
              {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'} needed
            </span>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-gray-600">All expenses are settled!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="bg-red-100 text-red-700 px-3 py-1 rounded-lg font-medium">
                      {transaction.fromName}
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-lg font-medium">
                      {transaction.toName}
                    </div>
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    ${transaction.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {transactions.length > 0 && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">How Settlement Works</h4>
            <p className="text-sm text-yellow-800">
              The debt simplification algorithm minimizes the number of transactions needed to settle all expenses.
              Instead of everyone paying everyone, we've optimized it to just {transactions.length} {transactions.length === 1 ? 'payment' : 'payments'}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
