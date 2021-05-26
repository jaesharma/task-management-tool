import React, { useState, useEffect } from "react";
import { Grid } from "@material-ui/core";
import { setupAuthentication } from "./actions/authActions";
import Spinner from "./components/spinners/Spinner";
import AppRouter from "./router/AppRouter";

const App = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function setup() {
      await setupAuthentication();
      setLoading(false);
    }
    setup();
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
