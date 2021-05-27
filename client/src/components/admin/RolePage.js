import {
  Divider,
  Grid,
  Typography,
  makeStyles,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
} from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { getUserRoles } from "../../utility/utilityFunctions/apiCalls";
import { setModalStateAction } from "../../actions/modalActions";
import Spinner from "../spinners/Spinner";

const useStyles = makeStyles((theme) => ({
  row: {
    padding: ".8rem 0",
    transition: "all ease-in-out .2s",
    "&:hover": {
      background: "#eee",
    },
  },
  heading: {
    fontSize: "1.2rem",
    fontWeight: 600,
    color: "#333",
    fontFamily: "Merriweather sans",
  },
}));

const RolePage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const classes = useStyles();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        let fetchedRoles = await getUserRoles();
        fetchedRoles = fetchedRoles.data.roles.map((role) => {
          role["dirty"] = false;
          return role;
        });
        setRoles(fetchedRoles);
        setLoading(false);
      } catch (error) {
        console.log(error);
        dispatch(
          setModalStateAction({
            showModal: true,
            text: "Something went wrong. Couldn't fetch user roles.",
            severity: "error",
          })
        );
        setRoles([]);
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const permissionChangeHandler = (checked, index, permission) => {
    setRoles((prevState) => {
      let updatedRoles = [...prevState];
      let currPermissions = new Set(updatedRoles[index].permissions);
      if (checked) currPermissions.add(permission);
      else currPermissions.delete(permission);
      updatedRoles[index].permissions = Array.from(currPermissions);
      updatedRoles[index].dirty = true;
      return Array.from(updatedRoles);
    });
  };

  return (
    <Grid container direction="column">
      <Grid container direction="row">
        <Typography
          style={{
            fontFamily: "Merriweather sans",
            fontSize: "1.4rem",
            fontWeight: 600,
            color: "#222",
          }}
        >
          User roles and permissions
        </Typography>
      </Grid>
      <Typography
        style={{
          marginTop: "1rem",
          marginBottom: "3rem",
          fontFamily: "Merriweather sans",
          fontWeight: 200,
          maxWidth: "80%",
        }}
      >
        These settings control how users get access to portal. You can allow
        existing users to create projects or form teams or prevent them from any
        of these actions.
      </Typography>
      <Grid container>
        <Grid item xs={4} className={classes.heading}>
          Role
        </Grid>
        <Grid item xs={6} className={classes.heading}>
          Permissions
        </Grid>
        <Grid
          item
          xs={2}
          container
          justify="center"
          style={{
            marginBottom: ".4rem",
          }}
        >
          <Button
            style={{
              background: "#eee",
            }}
          >
            Create Role
          </Button>
        </Grid>
      </Grid>
      <Divider />
      {loading ? (
        <Grid
          container
          style={{
            padding: "2rem 0",
          }}
        >
          <Spinner />
        </Grid>
      ) : (
        roles.map((role, index) => (
          <Grid
            container
            direction="row"
            alignItems="center"
            className={classes.row}
          >
            <Grid item xs={4}>
              <Typography
                style={{
                  fontSize: "1.2rem",
                  paddingLeft: "1rem",
                }}
              >
                {role.title}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={role.permissions.includes("CREATE_PROJECTS")}
                      onChange={(e) =>
                        permissionChangeHandler(
                          e.target.checked,
                          index,
                          "CREATE_PROJECTS"
                        )
                      }
                      name="create-projects"
                    />
                  }
                  label="Create Project"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={role.permissions.includes("CREATE_TEAM")}
                      onChange={(e) =>
                        permissionChangeHandler(
                          e.target.checked,
                          index,
                          "CREATE_TEAM"
                        )
                      }
                      name="create-team"
                    />
                  }
                  label="Create Team"
                />
              </FormGroup>
            </Grid>
            <Grid item xs={2} container justify="center">
              <Button
                disabled={!role.dirty}
                color="primary"
                variant="contained"
              >
                Update
              </Button>
            </Grid>
          </Grid>
        ))
      )}
    </Grid>
  );
};

export default RolePage;
