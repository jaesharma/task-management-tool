import React from "react";
import { Grid, Typography, Button, makeStyles } from "@material-ui/core";
import UserDetailsTable from "../tables/UserDetailsTable";

const useStyles = makeStyles((theme) => ({
  btnStyles: {
    textTransform: "none",
    backgroundColor: "#3352CC",
    marginRight: ".4rem",
    fontFamily: "Merriweather sans",
    fontWeight: 600,
  },
}));

const UsersPage = (props) => {
  const classes = useStyles();
  return (
    <>
      <Grid container direction="row" justify="space-between">
        <Typography
          varaint="h4"
          style={{
            fontWeight: 800,
          }}
        >
          Users
        </Typography>
        <Grid>
          <Button
            color="primary"
            variant="contained"
            disableElevation
            onClick={() => {
              props.setInviteUserDialog(true);
            }}
            className={classes.btnStyles}
          >
            Invite User
          </Button>
          <Button
            disableElevation
            className={classes.btnStyles}
            style={{
              backgroundColor: "#F2F3F5",
            }}
            onClick={() => {
              props.setExportCSVDialog(true);
            }}
          >
            Export users
          </Button>
        </Grid>
      </Grid>
      <UserDetailsTable inviteUserDialog={props.inviteUserDialog} />
    </>
  );
};

export default UsersPage;
