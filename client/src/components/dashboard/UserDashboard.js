import { Grid, Typography, Button, makeStyles } from "@material-ui/core";
import { NavLink, useHistory } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { setModalStateAction } from "../../actions/modalActions";
import { useDispatch } from "react-redux";
import { getProjects } from "../../utility/utilityFunctions/apiCalls";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: "3rem",
  },
  subContainer: {
    margin: "2rem 0",
  },
  rowContainer: {
    marginBottom: "1rem",
  },
  mainTitle: {
    fontSize: "1.3rem",
    fontFamily: "Merriweather Sans",
    fontWeight: 600,
  },
  subTitle: {
    fontSize: "1rem",
    fontFamily: "Merriweather Sans",
    fontWeight: 400,
  },
  link: {
    color: "#4273FD",
    fontSize: ".9rem",
    fontFamily: "Merriweather Sans",
    "&:hover": {
      color: "#445fad",
    },
  },
  btnStyles: {
    textTransform: "none",
    backgroundColor: "#3352CC",
    marginRight: ".4rem",
    fontFamily: "Merriweather sans",
    fontWeight: 600,
    marginTop: "1rem",
  },
  noProjectContainer: {
    minWidth: "100%",
    minHeight: "18rem",
  },
}));

const UserDashboard = () => {
  const classes = useStyles();
  const history = useHistory();
  const [projects, setProjects] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    getProjects()
      .then((resp) => {
        setProjects(resp.data.projects);
      })
      .catch((error) => {
        if (error.response?.data?.error)
          return dispatch(
            setModalStateAction({
              showModal: true,
              text: error.response.data.error,
              severity: "success",
            })
          );
        return dispatch(
          setModalStateAction({
            showModal: true,
            text: `Something went wrong`,
            severity: "success",
          })
        );
      });
  }, []);

  return (
    <Grid container direction="column" className={classes.container}>
      <Typography className={classes.mainTitle}>Your work</Typography>
      <Grid container direction="column" className={classes.subContainer}>
        {projects.length ? (
          <Grid
            container
            justify="space-between"
            className={classes.rowContainer}
          >
            <Typography className={classes.subTitle}>
              Recent projects
            </Typography>
            <NavLink to="/user/projects" className={classes.link}>
              View all projects
            </NavLink>
          </Grid>
        ) : (
          <Grid
            container
            direction="column"
            justify="center"
            alignItems="center"
            className={classes.noProjectContainer}
          >
            <Typography>You have no recently viewed projects</Typography>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              className={classes.btnStyles}
              disableElevation
              style={{
                color: "white",
                padding: ".2rem .6rem",
              }}
              onClick={() => history.push("/user/projects")}
            >
              View all projects
            </Button>
          </Grid>
        )}
        <Grid container>
          <Typography>Project Cards</Typography>
          <Typography>Project Cards</Typography>
          <Typography>Project Cards</Typography>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default UserDashboard;