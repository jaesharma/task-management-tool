import { AppBar, CssBaseline, Grid } from "@material-ui/core";
import UserAppbar from "../appbar/UserAppbar";
import React from "react";

const UserLayout = () => {
  return (
    <Grid container direction="column">
      <UserAppbar />
      <Grid container direction="column"></Grid>
    </Grid>
  );
};

export default UserLayout;
