// src/utils/iconMappings.js
import React from 'react';
import { 
    MdLocationOn, MdFlag, MdPerson, MdWarning, MdDirectionsCar, 
    MdGroup, MdCreditCard, MdSearch, MdMap, MdCheckCircle,
    MdConstruction, MdLocalPolice, MdAttachMoney, MdDirectionsTransit, MdAccountBalance,
    MdEmergencyRecording, MdTrendingUp, MdTrendingDown
} from 'react-icons/md';
import { FaApple } from 'react-icons/fa';

// Icon components with default styling
export const IconComponents = {
    location: <MdLocationOn />,
    flag: <MdFlag />,
    user: <MdPerson />,
    warning: <MdWarning />,
    car: <MdDirectionsCar />,
    people: <MdGroup />,
    creditCard: <MdCreditCard />,
    search: <MdSearch />,
    map: <MdMap />,
    check: <MdCheckCircle />,
    construction: <MdConstruction />,
    police: <MdLocalPolice />,
    money: <MdAttachMoney />,
    bus: <MdBus />,
    bank: <MdBank />,
    emergency: <MdEmergencyRecording />,
    apple: <FaApple />,
};

// Helper function to render inline icons with custom styles
export const renderIcon = (iconName, customStyle = {}) => {
    const icons = {
        location: MdLocationOn,
        flag: MdFlag,
        user: MdPerson,
        warning: MdWarning,
        car: MdDirectionsCar,
        people: MdGroup,
        creditCard: MdCreditCard,
        search: MdSearch,
        map: MdMap,
        check: MdCheckCircle,
        construction: MdConstruction,
        police: MdLocalPolice,
        money: MdAttachMoney,
        bus: MdDirectionsTransit,
        bank: MdAccountBalance,
        emergency: MdEmergencyRecording,
        apple: FaApple,
    };
    
    const Icon = icons[iconName];
    if (!Icon) return null;
    
    return <Icon style={{ ...customStyle }} />;
};

// Emoji to icon name mapping
export const emojiToIconMap = {
    '📍': 'location',
    '🏁': 'flag',
    '👤': 'user',
    '⚠️': 'warning',
    '🚗': 'car',
    '👥': 'people',
    '💳': 'creditCard',
    '🔍': 'search',
    '🗺️': 'map',
    '🗺': 'map',
    '✓': 'check',
    '✊': 'construction', // strike/huelga
    '💥': 'warning', // accident
    '🚧': 'construction',
    '👮': 'police',
    '💰': 'money',
    '🚌': 'bus',
    '🏦': 'bank',
    '🍎': 'apple',
    '🚨': 'emergency',
};
