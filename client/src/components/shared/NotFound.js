import { Grid, Typography } from "@material-ui/core";
import React from "react";

const NotFound = () => {
  return (
    <Grid
      container
      direction="column"
      justify="center"
      alignItems="center"
      style={{ width: "100vw", height: "60vh" }}
    >
      <Typography component="h1" variant="h1" color="textSecondary">
        404
      </Typography>
      <Typography component="h1" variant="h6" color="textPrimary">
        Page Not Found
      </Typography>
    </Grid>
  );
};

export default NotFound;
