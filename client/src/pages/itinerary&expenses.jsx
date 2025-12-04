import React, { useState, useEffect, useMemo } from 'react';

// ====================================================================
// --- 1. ATLAS MOCK & SHARED UTILITIES/CONSTANTS ---
// ====================================================================

const DEMO_TRIP_ID = 'tokyo-adventure-2026';
const MOCK_USERS = [
    { id: 'user_a', name: 'Alex (You)', color: 'bg-indigo-500' },
    { id: 'user_b', name: 'Ben', color: 'bg-pink-500' },
    { id: 'user_c', name: 'Chloe', color: 'bg-green-500' },
];

/**
 * MOCK DATABASE STATE (Simulating MongoDB Collections)
 */
const MOCK_DB_STATE = {
    activities: [
        { id: 'a1', name: 'Check-in to Airbnb', time: '15:00', location: 'Shinjuku', day: '2026-03-10', suggestedBy: 'user_a', isApproved: true, timestamp: Date.now() - 10000 },
        { id: 'a2', name: 'Shibuya Crossing Photo Op', time: '18:30', location: 'Shibuya', day: '2026-03-10', suggestedBy: 'user_b', isApproved: false, timestamp: Date.now() - 5000 },
    ],
    expenses: [
        { id: 'e1', description: 'Airport Train Tickets', amount: 80.00, paidBy: 'user_a', split: [{ userId: 'user_a', share: 26.67 }, { userId: 'user_b', share: 26.67 }, { userId: 'user_c', share: 26.66 }], date: '2026-03-10', timestamp: Date.now() - 15000 },
        { id: 'e2', description: 'First Night Dinner', amount: 150.00, paidBy: 'user_c', split: [{ userId: 'user_b', share: 75.00 }, { userId: 'user_c', share: 75.00 }], date: '2026-03-10', timestamp: Date.now() - 8000 },
    ]
};

// Helper to find user by ID
const getUser = (id) => MOCK_USERS.find(u => u.id === id) || { name: 'Unknown', color: 'bg-gray-400' };

/**
 * Custom UI Component: Panel (Container)
 */
const Panel = ({ title, children, className = '' }) => (
    <div className={`bg-white p-6 rounded-xl shadow-lg ${className}`}>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">{title}</h2>
        {children}
    </div>
);

/**
 * Custom UI Component: UserChip (Shows user and balance/payer status)
 */
const UserChip = ({ userId, amount, isPayer = false }) => {
    const user = getUser(userId);
    const amountClass = amount !== undefined && amount >= 0 ? 'text-green-600' : 'text-red-600';
    const sign = amount !== undefined && amount >= 0 ? '+' : '';

    return (
        <span className={`inline-flex items-center text-sm font-medium px-3 py-1 rounded-full ${user.color} bg-opacity-10 ${isPayer ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}>
            <span className={`h-2 w-2 rounded-full mr-2 ${user.color} ${user.color.replace('-500', '-600')}`}></span>
            {user.name}
            {amount !== undefined && (
                <span className={`ml-2 font-semibold ${amountClass}`}>
                    {sign}{Math.abs(amount).toFixed(2)}
                </span>
            )}
        </span>
    );
};

/**
 * A mock hook to simulate fetching data from an Atlas backend via an API.
 */
const useAtlasData = (collectionName) => {
    const [data, setData] = useState(MOCK_DB_STATE[collectionName]);
    const [isLoading, setIsLoading] = useState(true);

    // Simulate initial data fetch
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setData(MOCK_DB_STATE[collectionName]);
            setIsLoading(false);
        }, 800);

        return () => clearTimeout(timeoutId);
    }, [collectionName]);

    /**
     * Simulates adding a new document (POST request to Atlas API endpoint).
     */
    const addAtlasData = (newItem) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const docId = `doc_${Date.now()}`;
                const newDoc = { 
                    id: docId, 
                    ...newItem, 
                    timestamp: Date.now() 
                };

                // Update the shared mock state for "real-time" sync
                MOCK_DB_STATE[collectionName] = [newDoc, ...MOCK_DB_STATE[collectionName]];
                
                // Update local component state
                setData(MOCK_DB_STATE[collectionName]);
                resolve(newDoc);
            }, 500);
        });
    };

    return { data, isLoading, addAtlasData };
};

/**
 * Calculates the minimum number of transactions required to settle all debts (Min-Cash Flow).
 */
const simplifyDebts = (expenses) => {
    // 1. Calculate Net Balances
    const balances = {};
    MOCK_USERS.forEach(u => balances[u.id] = 0);

    expenses.forEach(expense => {
        const total = expense.amount;
        const paidBy = expense.paidBy;

        // The payer is owed the full amount initially
        balances[paidBy] = (balances[paidBy] || 0) + total;

        // Distribute the debt among the split participants
        expense.split.forEach(splitItem => {
            const debtorId = splitItem.userId;
            const debt = splitItem.share;

            // The debtor's balance is reduced by their share of the expense
            balances[debtorId] = (balances[debtorId] || 0) - debt;
        });
    });

    // 2. Separate Creditors (Owe > 0) and Debtors (Owe < 0)
    let creditors = [];
    let debtors = [];

    for (const [userId, balance] of Object.entries(balances)) {
        if (Math.abs(balance) < 0.01) continue; // Ignore settled balances

        if (balance > 0) {
            creditors.push({ id: userId, amount: balance });
        } else if (balance < 0) {
            debtors.push({ id: userId, amount: -balance }); // Store as positive debt amount
        }
    }

    // 3. Create Simplified Transactions (Greedy Algorithm)
    const transactions = [];
    let i = 0;
    let j = 0;

    // Use two pointers to match the largest creditor with the largest debtor
    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        const settledAmount = Math.min(debtor.amount, creditor.amount);

        if (settledAmount > 0.01) {
            transactions.push({
                payerId: debtor.id,
                receiverId: creditor.id,
                amount: settledAmount,
            });

            // Update remaining balances
            debtor.amount -= settledAmount;
            creditor.amount -= settledAmount;
        }

        // Move the pointer for anyone who has settled their full amount
        if (debtor.amount < 0.01) {
            i++;
        }
        if (creditor.amount < 0.01) {
            j++;
        }
    }

    return transactions;
};


// ====================================================================
// --- 2. ITINERARY PAGE COMPONENT (Merged) ---
// ====================================================================

const ItineraryPage = ({ activities, currentUserId, isLoading, addActivity }) => {
    const [name, setName] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [day, setDay] = useState('2026-03-10'); // Mock start date
    const [isSaving, setIsSaving] = useState(false);

    const handleAddActivity = async (e) => {
        e.preventDefault();
        if (!name || !time || !day || isSaving) return;

        setIsSaving(true);
        try {
            await addActivity({
                name,
                time,
                location,
                day,
                suggestedBy: currentUserId,
                isApproved: false,
                documentUrl: null,
            });
            setName('');
            setTime('');
            setLocation('');
        } catch (error) {
            console.error("Error adding activity: ", error);
        } finally {
            setIsSaving(false);
        }
    };

    const sortedActivities = useMemo(() => {
        return activities.slice().sort((a, b) => {
            // Sort by day, then by time
            if (a.day < b.day) return -1;
            if (a.day > b.day) return 1;
            return a.time.localeCompare(b.time);
        });
    }, [activities]);

    const groupedActivities = useMemo(() => {
        return sortedActivities.reduce((acc, activity) => {
            const date = activity.day;
            if (!acc[date]) acc[date] = [];
            acc[date].push(activity);
            return acc;
        }, {});
    }, [sortedActivities]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        // Using a standard format that works across browsers
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
                {DEMO_TRIP_ID.toUpperCase().replace('-', ' ')} Itinerary
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Add Activity Form */}
                <Panel title="Suggest New Activity" className="lg:col-span-1 h-fit">
                    <form onSubmit={handleAddActivity} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Activity Name (e.g., Robot Restaurant Show)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                        <input
                            type="date"
                            value={day}
                            onChange={(e) => setDay(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Location (Optional, e.g., Shinjuku)"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-150 disabled:bg-indigo-400"
                        >
                            {isSaving ? 'Suggesting...' : 'Suggest Activity'}
                        </button>
                    </form>
                    <div className="mt-4 text-xs text-gray-500">
                        *Updates simulate real-time sync with MongoDB Atlas backend.
                    </div>
                </Panel>

                {/* 2. Collaborative Timeline */}
                <div className="lg:col-span-2 space-y-8">
                    {isLoading ? (
                         <div className="text-center p-10 text-gray-500">Loading Itinerary from Atlas...</div>
                    ) : (
                        Object.keys(groupedActivities).length === 0 ? (
                            <div className="text-center p-10 bg-white rounded-xl shadow-lg">
                                <p className="text-gray-500">No activities planned yet. Suggest the first one!</p>
                            </div>
                        ) : (
                            Object.entries(groupedActivities).map(([date, dayActivities]) => (
                                <Panel key={date} title={formatDate(date)} className="p-4 md:p-6">
                                    <ol className="relative border-l border-gray-200 ml-3">
                                        {dayActivities.map((activity) => (
                                            <li key={activity.id} className="mb-6 ml-6">
                                                <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-4 ring-white ${activity.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {activity.isApproved ? '✅' : '⏳'}
                                                </span>
                                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <time className="text-sm font-semibold text-gray-600">{activity.time}</time>
                                                        {/* UserChip is defined globally in this file */}
                                                        <UserChip userId={activity.suggestedBy} />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900">{activity.name}</h3>
                                                    {activity.location && <p className="text-sm text-gray-500 italic">Location: {activity.location}</p>}
                                                </div>
                                            </li>
                                        ))}
                                    </ol>
                                </Panel>
                            ))
                        )
                    )}
                </div>
            </div>
        </div>
    );
};


// ====================================================================
// --- 3. EXPENSE PAGE COMPONENT (Required Dependency) ---
// ====================================================================

const ExpensePage = ({ expenses, currentUserId, isLoading, addExpense }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState(currentUserId);
    const [splitType, setSplitType] = useState('equal');
    // Initialize split shares
    const [splitShares, setSplitShares] = useState(MOCK_USERS.map(u => ({ userId: u.id, shareValue: u.id === currentUserId ? '' : 0 }))); 
    const [isSaving, setIsSaving] = useState(false);

    // Derived State: Calculate Balances and Simplified Debts
    const { balances, simplifiedDebts } = useMemo(() => {
        const calculatedBalances = {};
        MOCK_USERS.forEach(u => calculatedBalances[u.id] = 0);
        
        // Step 1: Calculate Net Balances
        expenses.forEach(expense => {
            const total = expense.amount;
            const paidById = expense.paidBy;

            // Payer is owed the full amount
            calculatedBalances[paidById] = (calculatedBalances[paidById] || 0) + total;

            // Subtract each person's share
            expense.split.forEach(splitItem => {
                const debtorId = splitItem.userId;
                const debt = splitItem.share;
                calculatedBalances[debtorId] = (calculatedBalances[debtorId] || 0) - debt;
            });
        });

        // Step 2: Simplify Debts
        const simplifiedDebts = simplifyDebts(expenses);

        return { balances: calculatedBalances, simplifiedDebts };
    }, [expenses]);


    // Handle split share change
    const handleShareChange = (userId, value) => {
        setSplitShares(prev => prev.map(s => 
            s.userId === userId ? { ...s, shareValue: parseFloat(value) || 0 } : s
        ));
    };

    // Calculate split data for submission
    const getSplitData = () => {
        const totalAmount = parseFloat(amount);
        if (isNaN(totalAmount) || totalAmount <= 0) return null;

        if (splitType === 'equal') {
            const numParticipants = MOCK_USERS.length; // Assuming everyone participates in an equal split for simplicity
            const share = totalAmount / numParticipants;

            return MOCK_USERS.map(u => ({
                userId: u.id,
                share: parseFloat(share.toFixed(2))
            }));
        } else if (splitType === 'custom') {
            // Only include users who have a share > 0
            return splitShares
                .filter(s => s.shareValue > 0)
                .map(s => ({
                    userId: s.userId,
                    share: parseFloat(s.shareValue.toFixed(2))
                }));
        }
        return null;
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        const totalAmount = parseFloat(amount);
        if (!description || isNaN(totalAmount) || totalAmount <= 0 || isSaving) return;
        
        const splitData = getSplitData();
        if (!splitData) return;

        // Validation for custom split total
        const totalSplitSum = splitData.reduce((sum, item) => sum + item.share, 0);
        if (splitType === 'custom' && Math.abs(totalSplitSum - totalAmount) > 0.01) {
             console.error("Custom split sum does not equal total amount.");
             console.error(`Error: Custom shares ($${totalSplitSum.toFixed(2)}) must equal the total amount ($${totalAmount.toFixed(2)}).`);
             return;
        }


        setIsSaving(true);
        try {
            await addExpense({
                description,
                amount: totalAmount,
                paidBy,
                split: splitData,
                currency: 'USD',
                date: new Date().toISOString().split('T')[0],
            });

            // Reset form
            setDescription('');
            setAmount('');
            setSplitType('equal');
            // Re-initialize split shares to clear custom values
            setSplitShares(MOCK_USERS.map(u => ({ userId: u.id, shareValue: '' })));
        } catch (error) {
            console.error("Error adding expense: ", error);
        } finally {
            setIsSaving(false);
        }
    };

    // Calculate sum of custom shares for display
    const totalCustomSplit = splitShares.reduce((sum, s) => sum + (parseFloat(s.shareValue) || 0), 0).toFixed(2);


    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
                Group Expense Splitter (USD)
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Add Expense Form */}
                <Panel title="Log New Expense" className="lg:col-span-1 h-fit">
                    <form onSubmit={handleAddExpense} className="space-y-4">
                        {/* Description and Amount */}
                        <input
                            type="text"
                            placeholder="Description (e.g., Dinner at Sushi Place)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                            required
                        />
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="Total Amount (USD)"
                                value={amount}
                                step="0.01"
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                                required
                            />
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">$</span>
                        </div>
                        
                        {/* Paid By */}
                        <select
                            value={paidBy}
                            onChange={(e) => setPaidBy(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 bg-white"
                        >
                            <option disabled>Paid By</option>
                            {MOCK_USERS.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>

                        {/* Split Type */}
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => setSplitType('equal')}
                                className={`flex-1 p-2 rounded-lg font-semibold transition ${splitType === 'equal' ? 'bg-pink-600 text-white' : 'bg-pink-100 text-pink-600 hover:bg-pink-200'}`}
                            >
                                Equal Split
                            </button>
                            <button
                                type="button"
                                onClick={() => setSplitType('custom')}
                                className={`flex-1 p-2 rounded-lg font-semibold transition ${splitType === 'custom' ? 'bg-pink-600 text-white' : 'bg-pink-100 text-pink-600 hover:bg-pink-200'}`}
                            >
                                Custom Split
                            </button>
                        </div>
                        
                        {/* Custom Split Inputs */}
                        {splitType === 'custom' && (
                            <div className="space-y-2 pt-2 border-t mt-4 border-gray-200">
                                {MOCK_USERS.map(user => (
                                    <div key={user.id} className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-gray-700">{user.name}</label>
                                        <div className="relative w-1/2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="Share"
                                                value={splitShares.find(s => s.userId === user.id)?.shareValue || ''}
                                                onChange={(e) => handleShareChange(user.id, e.target.value)}
                                                className="w-full pl-8 py-2 border border-gray-300 rounded-lg text-sm"
                                            />
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">$</span>
                                        </div>
                                    </div>
                                ))}
                                <div className="text-right text-sm font-semibold text-gray-600 pt-2">
                                    Total Custom Split: ${totalCustomSplit}
                                </div>
                            </div>
                        )}


                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition duration-150 disabled:bg-pink-400"
                        >
                            {isSaving ? 'Logging...' : 'Log Expense'}
                        </button>
                    </form>
                </Panel>

                {/* 2. Debt & Balance Dashboard */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Personal Balances */}
                    <Panel title="Live Balances" className="p-4 md:p-6">
                        <div className="grid grid-cols-2 gap-4">
                            {MOCK_USERS.map(user => (
                                <div key={user.id} className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                        <div className={`w-3 h-3 rounded-full mr-2 ${user.color}`}></div>
                                        {user.name}
                                    </h3>
                                    <p className={`text-2xl font-extrabold mt-1 ${balances[user.id] >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {balances[user.id] >= 0 ? 'Owed: $' : 'Owe: $'}
                                        {Math.abs(balances[user.id]).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Panel>

                    {/* Simplified Settlements */}
                    <Panel title="Settle Debts (Min. Transactions)" className="p-4 md:p-6">
                        {simplifiedDebts.length === 0 ? (
                            <p className="text-gray-500 italic">Everyone is settled up! All balances are zero.</p>
                        ) : (
                            <div className="space-y-4">
                                <div className="text-sm font-medium text-gray-600">
                                    The Min-Cash Flow algorithm reduces the total number of transfers.
                                </div>
                                {simplifiedDebts.map((t, index) => (
                                    <div key={index} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between shadow-sm">
                                        <div className="text-sm font-semibold text-gray-800">
                                            <UserChip userId={t.payerId} />
                                            <span className="mx-2 text-yellow-700">PAYS</span>
                                            <UserChip userId={t.receiverId} />
                                        </div>
                                        <span className="text-xl font-extrabold text-yellow-800">
                                            ${t.amount.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                                <button className="w-full bg-yellow-500 text-white py-2 rounded-lg font-semibold hover:bg-yellow-600 transition">
                                    Mark All Settled
                                </button>
                            </div>
                        )}
                    </Panel>
                    
                    {/* Expense History */}
                    <Panel title="Expense History" className="p-4 md:p-6">
                        {isLoading ? (
                            <div className="text-center p-5 text-gray-500">Loading Expenses from Atlas...</div>
                        ) : (
                            expenses.length === 0 ? (
                                <p className="text-gray-500 italic">No expenses logged yet. Add your first bill!</p>
                            ) : (
                                <div className="space-y-3">
                                    {expenses.slice().sort((a, b) => b.timestamp - a.timestamp).map((expense) => (
                                        <div key={expense.id} className="p-3 border-b border-gray-100 flex justify-between items-center bg-white hover:bg-gray-50 transition rounded-lg shadow-sm">
                                            <div>
                                                <p className="font-semibold text-gray-900">{expense.description}</p>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Paid by <UserChip userId={expense.paidBy} />
                                                    <span className="ml-2">| Split: {expense.split.map(s => getUser(s.userId).name).join(', ')}</span>
                                                </div>
                                            </div>
                                            <span className="text-xl font-bold text-pink-600">${expense.amount.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </Panel>
                </div>
            </div>
        </div>
    );
};


// ====================================================================
// --- 4. Main App Component (Router) ---
// ====================================================================

export const App = () => {
    // Current user is Alex (user_a) for this demo
    const currentUserId = 'user_a'; 
    const [view, setView] = useState('itinerary'); // 'itinerary' or 'expenses'

    // Simulate Atlas API fetches using mock hook
    const { 
        data: activities, 
        isLoading: isActivitiesLoading, 
        addAtlasData: addActivity 
    } = useAtlasData('activities');

    const { 
        data: expenses, 
        isLoading: isExpensesLoading, 
        addAtlasData: addExpense 
    } = useAtlasData('expenses');

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Navigation Header */}
            <header className="bg-white shadow-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                    <div className="text-xl font-bold text-gray-800">
                        {DEMO_TRIP_ID.toUpperCase().replace('-', ' ')}
                    </div>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setView('itinerary')}
                            className={`px-4 py-2 rounded-full font-semibold transition ${view === 'itinerary' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            Itinerary
                        </button>
                        <button
                            onClick={() => setView('expenses')}
                            className={`px-4 py-2 rounded-full font-semibold transition ${view === 'expenses' ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            Expenses
                        </button>
                    </div>
                    <div className="text-sm text-gray-500">
                        Logged in as <UserChip userId={currentUserId} />
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main>
                {view === 'itinerary' ? (
                    <ItineraryPage 
                        activities={activities} 
                        currentUserId={currentUserId} 
                        isLoading={isActivitiesLoading} 
                        addActivity={addActivity} 
                    />
                ) : (
                    <ExpensePage 
                        expenses={expenses} 
                        currentUserId={currentUserId} 
                        isLoading={isExpensesLoading} 
                        addExpense={addExpense} 
                    />
                )}
            </main>
        </div>
    );
};

export default App;