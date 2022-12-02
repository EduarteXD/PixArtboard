import React from "react";
import PixArtBoard from "./components/PixArtboard";
import {
  Routes,
  Route,
  useLocation
} from "react-router-dom";

import "./App.scss";
import Introduction from "./components/Introduction";

const App = () => {
  const location = useLocation()

  return (
    <>
      <Routes key={location.pathname} location={location}>
        <Route path='/place'
          element={
            <PixArtBoard />
          }
        />
        <Route path='/'
          element={
            <Introduction />
          }
        />
      </Routes>
    </>
  )
};

export default App;
