import React from "react";
import { Grid, Typography, Button } from "@material-ui/core";
import UserDetailsTable from "../tables/UserDetailsTable";

const UsersPage = (props) => {
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
            onClick={() => {
              props.setInviteUserDialog(true);
            }}
          >
            Invite User
          </Button>
        </Grid>
      </Grid>
      <UserDetailsTable />
    </>
  );
};

export default UsersPage;
