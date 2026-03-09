import React, { createContext, useContext, useState, useMemo } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [payments, setPayments] = useState([
        {
            id: "p1",
            tenant: "Amit",
            amount: 1200,
            status: "collected",
            month: "February 2026",
            date: "Feb 28, 2026",
            time: "10:30 AM",
            rawDate: "2026-02-28T00:00:00.000Z",
            phone: "9876543210",
        },
        {
            id: "p2",
            tenant: "Priya",
            amount: 800,
            status: "pending",
            month: "February 2026",
            date: "Feb 27, 2026",
            time: "02:15 PM",
            rawDate: "2026-02-27T00:00:00.000Z",
            phone: "9123456789",
        },
        {
            id: "p3",
            tenant: "Ravi",
            amount: 600,
            status: "pending",
            month: "February 2026",
            date: "Feb 26, 2026",
            time: "11:00 AM",
            rawDate: "2026-02-26T00:00:00.000Z",
            phone: "9988776655",
        },
        {
            id: "p4",
            tenant: "Neha",
            amount: 900,
            status: "collected",
            month: "January 2026",
            date: "Jan 30, 2026",
            time: "09:45 AM",
            rawDate: "2026-01-30T00:00:00.000Z",
            phone: "9887766554",
        },
    ]);

    const [expenses, setExpenses] = useState([]);

    const totalCollected = useMemo(() => {
        return payments
            .filter((p) => p.status === "collected")
            .reduce((sum, p) => sum + p.amount, 0);
    }, [payments]);

    const addPayment = (payment) => {
        setPayments((prev) => [payment, ...prev]);
    };

    const updatePaymentStatus = (id, status) => {
        setPayments((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status } : p))
        );
    };

    const removePayment = (id) => {
        setPayments((prev) => prev.filter((p) => p.id !== id));
    };

    const addExpense = (expense) => {
        setExpenses((prev) => [expense, ...prev]);
    };

    const removeExpense = (id) => {
        setExpenses((prev) => prev.filter((e) => e.id !== id));
    };

    return (
        <AppContext.Provider
            value={{
                payments,
                totalCollected,
                addPayment,
                updatePaymentStatus,
                removePayment,
                expenses,
                addExpense,
                removeExpense,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
