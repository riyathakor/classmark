import { createContext, useContext, useEffect, useReducer } from 'react';
import * as paymentStorage from '../storage/paymentStorage';
import { todayKey } from '../utils/date';

const PaymentContext = createContext(null);

const initialState = {
    isLoading: true,
    payments: [],
};

function reducer(state, action) {
    switch (action.type) {
        case 'SET_PAYMENTS':
            return { ...state, isLoading: false, payments: action.payments };
        default:
            return state;
    }
}

export function PaymentProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    async function refresh() {
        const payments = await paymentStorage.getAllPayments();
        dispatch({ type: 'SET_PAYMENTS', payments });
    }

    useEffect(() => {
        refresh();
    }, []);

    function getPayment(studentId, month) {
        return state.payments.find((p) => p.studentId === studentId && p.month === month) || null;
    }

    async function markPaid(studentId, classId, month, amount) {
        await paymentStorage.markPaid(studentId, classId, month, amount, todayKey());
        await refresh();
    }

    async function undoPayment(studentId, month) {
        await paymentStorage.undoPayment(studentId, month);
        await refresh();
    }

    return (
        <PaymentContext.Provider value={{ ...state, getPayment, markPaid, undoPayment, refresh }}>
            {children}
        </PaymentContext.Provider>
    );
}

export function usePayments() {
    const ctx = useContext(PaymentContext);
    if (!ctx) throw new Error('usePayments must be used within PaymentProvider');
    return ctx;
}