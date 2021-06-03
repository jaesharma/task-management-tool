import React, { useEffect, useState } from "react";
import { Grid, Typography, makeStyles } from "@material-ui/core";
import { useDispatch } from "react-redux";
import { setModalStateAction } from "../../actions/modalActions";
import { getProjectById } from "../../utility/utilityFunctions/apiCalls";
import { NavLink } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "react-feather";
import Sidebar from "./Sidebar";

const useStyles = makeStyles((theme) => ({
  toggleBtn: {
    position: "absolute",
    top: "20%",
    left: "4px",
    backgroundColor: "#fff",
    fontWeight: 600,
    border: "1px solid #aaa",
    width: "22px",
    height: "22px",
    dispaly: "flex",
    boxShadow: "1px 1px 14px 2px #eee",
    borderRadius: "14px",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    color: "#000",
    textAlign: "center",
    transition: "all ease-in-out .2s",
    "&:hover": {
      backgroundColor: "#3192cc",
      cursor: "pointer",
      color: "white",
    },
  },
  sidebarDivider: {
    borderRight: "1px solid #ccc",
    maxWidth: "1rem",
    minHeight: "100vh",
    transition: "all ease-in-out .3s",
  },
}));

const BoardsPage = (props) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dispatch = useDispatch();
  useEffect(() => {
    setLoading(true);
    getProjectById(props.match.params.pid)
      .then((resp) => {
        setLoading(false);
        setProject(resp.data.project);
      })
      .catch((error) => {
        setLoading(false);
        if (error.response?.data?.error)
          return dispatch(
            setModalStateAction({
              showModal: true,
              text: error.response.data.error,
              severity: "error",
            })
          );
        dispatch(
          setModalStateAction({
            showModal: true,
            text: "Something went wrong. Try again later",
            severity: "error",
          })
        );
      });
  }, [props.match.params.pid]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };
  return (
    <Grid
      container
      style={{
        flexWrap: "nowrap",
        transition: "all ease-in-out .3s",
      }}
    >
      <Grid
        item
        xs={sidebarOpen ? 2 : 0}
        container
        direction="column"
        style={{
          maxWidth: sidebarOpen ? "" : "1px",
          flexWrap: "nowrap",
          overflow: "hidden",
          transition: "all ease-in-out .1s",
        }}
      >
        <Sidebar project={project} />
      </Grid>
      <Grid
        item
        xs={1}
        container
        className={classes.sidebarDivider}
        style={{
          maxWidth: sidebarOpen ? "1px" : "1rem",
        }}
      >
        <Typography
          onClick={() => toggleSidebar()}
          className={classes.toggleBtn}
          style={{
            left: sidebarOpen ? "15.8%" : "",
          }}
        >
          {sidebarOpen ? (
            <ChevronLeft size={12} strokeWidth={4} />
          ) : (
            <ChevronRight size={12} strokeWidth={4} />
          )}
        </Typography>
      </Grid>
      <Grid
        item
        xs={10}
        container
        style={{
          transition: "all ease-in-out .4s",
        }}
      >
        <Typography>
          <NavLink to="/user/projects">Projects </NavLink>/ {project.title}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default BoardsPage;
