import { format } from 'date-fns';

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD', // Or user preference
    }).format(amount);
};

export const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return format(new Date(dateStr), 'MMM dd, yyyy');
};
