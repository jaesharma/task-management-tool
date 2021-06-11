import {
  Grid,
  Typography,
  Button,
  makeStyles,
  CircularProgress,
} from "@material-ui/core";
import { NavLink, useHistory } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { setModalStateAction } from "../../actions/modalActions";
import { updateProjectAction } from "../../actions/userInfoActions";
import { useDispatch, useSelector } from "react-redux";
import {
  getProjects,
  starProject,
} from "../../utility/utilityFunctions/apiCalls";
import ProjectCard from "../project/ProjectCard";
import { Star } from "react-feather";

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
  menuText: {
    fontSize: ".9rem",
    fontFamily: "Merriweather Sans",
    fontWeight: 400,
    color: "#47526E",
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
  starred: {
    fill: "#F5AB00",
    stroke: "#F5AB00",
  },
  noProjectContainer: {
    minWidth: "100%",
    minHeight: "18rem",
  },
  headingLink: {
    color: "#444",
    textDecoration: "none",
    "&:hover": {
      color: "#4273fd",
    },
  },
}));

const listMenus = [
  // {
  //   label: "Worked on",
  //   name: "workedOn",
  // },
  // {
  //   label: "Viewed",
  //   name: "viewed",
  // },
  // {
  //   label: "Assigned to me",
  //   name: "assigned",
  // },
  {
    label: "Starred",
    name: "starred",
  },
];

const UserDashboard = () => {
  const classes = useStyles();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState("starred");
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [starredProjects, setStarredProjects] = useState([]);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.authReducer.user);

  useEffect(() => {
    getProjects()
      .then((resp) => {
        setLoading(false);
        setProjects(resp.data.projects);
      })
      .catch((error) => {
        console.log(error);
        handleApiCallError(error);
      });
    setSelected("starred");
  }, []);

  useEffect(() => {
    filterStarredProjects();
  }, [projects, user.projects]);

  const handleApiCallError = (error) => {
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
        severity: "error",
      })
    );
  };

  const filterStarredProjects = () => {
    const starredProjectIds = user.projects
      .filter((project) => project.starred)
      .map((project) => project.project);
    const starredProjects = projects.filter((project) =>
      starredProjectIds.includes(project.project._id)
    );
    setStarredProjects(starredProjects);
  };

  const clickHandler = (e) => {
    setSelectedLoading(true);
    setSelected(e.target.name);
  };

  const unstar = (projectId) => {
    starProject(projectId)
      .then((resp) => {
        const { project: updatedProject } = resp.data;
        dispatch(updateProjectAction({ updatedProject }));
      })
      .catch((error) => {
        console.log(error);
        handleApiCallError(error);
      });
  };

  const sendJobs = () => {
    switch (selected) {
      case "workedOn":
        return;
      case "viewed":
        return;
      case "assigned":
        return;
      case "starred":
        return;
      default:
        return;
    }
  };

  return (
    <Grid container direction="column" className={classes.container}>
      <Typography className={classes.mainTitle}>Your work</Typography>
      <Grid container direction="column" className={classes.subContainer}>
        {loading ? (
          <CircularProgress size={18} />
        ) : projects.length ? (
          <>
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
            <Grid container className={classes.rowContainer}>
              {projects.slice(0, 5).map((project) => (
                <ProjectCard project={project.project} />
              ))}
            </Grid>
          </>
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
      </Grid>
      <Grid container direction="column">
        <Grid
          container
          justify="space-between"
          style={{
            borderBottom: "1px solid #eee",
            width: "26rem",
            padding: ".4rem 1rem",
          }}
        >
          {listMenus.map((menu) => (
            <Typography
              name={menu.name}
              onClick={(e) => clickHandler(e)}
              className={classes.menuText}
            >
              {menu.label}
            </Typography>
          ))}
        </Grid>
        {starredProjects.map((project) => (
          <Grid
            container
            alignItems="center"
            style={{
              flexWrap: "nowrap",
              padding: ".5rem",
            }}
          >
            <Grid
              item
              xs={1}
              container
              justify="flex-end"
              style={{ flexWrap: "nowrap", height: "100%", maxWidth: "2rem" }}
            >
              <Star
                size={15}
                onClick={() => unstar(project.project._id)}
                className={classes.starred}
              />
            </Grid>
            <Grid
              item
              xs={1}
              container
              justify="center"
              style={{
                maxWidth: "3rem",
              }}
            >
              <img
                src={project.project.icon}
                style={{ width: "50%", borderRadius: "3px" }}
              />
            </Grid>
            <Grid item xs={4} container direction="column" justify="flex-start">
              <NavLink
                to={`/projects/${project.project._id}/board`}
                className={classes.headingLink}
              >
                <Typography>{project.project.title}</Typography>
              </NavLink>
            </Grid>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

export default UserDashboard;
