import React, { useEffect } from "react";
import { Grid } from "@material-ui/core";
import { setInitialSession } from "./actions/authActions";
import Spinner from "./components/spinners/Spinner";
import AppRouter from "./router/AppRouter";
import { useDispatch, useSelector } from "react-redux";
import AOS from "aos";
import "aos/dist/aos.css";

const App = () => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.authReducer.loading);
  useEffect(() => {
    dispatch(setInitialSession());
    AOS.init({
      offset: 200,
      duration: 600,
      easing: "ease-in-sine",
      delay: 100,
    });
    AOS.refresh();
  }, []);

  if (loading)
    return (
      <Grid
        container
        align="center"
        alignItems="center"
        alignContent="center"
        justify="center"
        style={{
          width: "100vw",
          height: "100vh",
        }}
      >
        <Spinner />
      </Grid>
    );

  return <AppRouter />;
};

export default App;
