import React, { createContext, useContext, useState } from 'react';

const CardContext = createContext();

export const CardProvider = ({ children }) => {
    const [timeLeft, setTimeLeft] = useState(0); 
    const [isCardValidated, setIsCardValidated] = useState(false);
  
    return (
      <CardContext.Provider value={{ timeLeft, setTimeLeft, isCardValidated, setIsCardValidated }}>
        {children}
      </CardContext.Provider>
    );
  };
  

export const useCardContext = () => useContext(CardContext);