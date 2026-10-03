import { createContext, useContext } from "react";

// "Papan bersama": data dan fungsi dari BriaStatusBoard yang dibaca oleh
// komponen-komponen bagian layar (Home, Tabel, Settings, dst).
export const BoardContext = createContext(null);
export const useBoard = () => useContext(BoardContext);
