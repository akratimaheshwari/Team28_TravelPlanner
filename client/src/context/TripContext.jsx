import { createContext, useContext, useState } from 'react';


const TripContext = createContext();
export const useTrips = () => useContext(TripContext);


export function TripProvider({ children }) {
const [trips, setTrips] = useState([]);
return (
<TripContext.Provider value={{ trips, setTrips }}>
{children}
</TripContext.Provider>
);
}