import {
  CircularProgress,
  Grid,
  Typography,
  makeStyles,
  Button,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import ProjectListTable from "../tables/ProjectListTable";
import { getProjects } from "../../utility/utilityFunctions/apiCalls";
import { setModalStateAction } from "../../actions/modalActions";
import { setCreateProjectDialogAction } from "../../actions/dialogActions";
import { useDispatch } from "react-redux";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: "2rem",
  },
  subContainer: {
    maxWidth: "40%",
  },
  img: {
    margin: "2rem 0",
  },
  t1: {
    fontSize: "1.3rem",
    fontWeight: 600,
    fontFamily: "Merriweather Sans",
  },
  t2: {
    fontSize: ".9rem",
    margin: "1rem 0",
    marginBottom: ".5rem",
    fontFamily: "Merriweather Sans",
  },
  btnStyles: {
    textTransform: "none",
    backgroundColor: "#3352CC",
    marginRight: ".4rem",
    fontFamily: "Merriweather Sans",
    fontWeight: 600,
    marginTop: "1rem",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#5275ff",
    },
  },
}));

const ProjectsPage = (props) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const classes = useStyles();
  useEffect(() => {
    if (props.projects) {
      setProjects(props.projects);
      setLoading(false);
    } else {
      getProjects()
        .then((resp) => {
          setProjects(resp.data.projects);
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
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
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <Grid container justify="center">
        <CircularProgress />
      </Grid>
    );
  }

  return (
    <Grid container direction="column" className={classes.container}>
      <Typography className={classes.t1}>Projects</Typography>
      {projects.length ? (
        <ProjectListTable />
      ) : (
        <Grid
          container
          direction="column"
          alignItems="center"
          className={classes.subContainer}
          style={{
            alignSelf: "center",
          }}
        >
          <img
            src="/assets/folder.svg"
            alt="folder"
            width="30%"
            className={classes.img}
          />
          <Typography
            className={classes.t1}
            style={{
              fontWeight: 400,
            }}
          >
            You currently have no projects
          </Typography>
          <Typography className={classes.t2}>
            Let's create your first project
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => dispatch(setCreateProjectDialogAction(true))}
            disableElevation
            className={classes.btnStyles}
          >
            Create project
          </Button>
        </Grid>
      )}
    </Grid>
  );
};

export default ProjectsPage;
