import { Divider, Grid, makeStyles, Typography } from "@material-ui/core";
import React from "react";
import { NavLink } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  container: {
    minWidth: "16rem",
    maxWidth: "16rem",
    minHeight: "10rem",
    maxHeight: "10rem",
    border: "1px solid #eee",
    margin: ".5rem",
    borderRadius: "3px",
    transition: "all .4s ease-in-out",
    "&:hover": {
      boxShadow: "0px 0px 10px 1px #89c6f5",
    },
  },
  sideColor: {
    backgroundColor: "#F8BDAD",
  },
  content: {
    padding: ".6rem 1rem .4rem 1.4rem",
    flexWrap: "nowrap",
    width: "100%",
  },
  staticIcon: {
    maxWidth: "1.5rem",
    maxHeight: "1.5rem",
    position: "absolute",
    marginTop: "1rem",
    marginLeft: ".6rem",
  },
}));

const ProjectCard = ({ project }) => {
  const classes = useStyles();
  return (
    <Grid container className={classes.container}>
      <div className={classes.staticIcon}>
        <img
          src={project.icon}
          style={{
            width: "100%",
            borderRadius: "2px",
          }}
        />
      </div>
      <Grid item xs={1} container className={classes.sideColor}></Grid>
      <Grid
        item
        xs={11}
        container
        direction="column"
        justify="space-between"
        style={{
          flexWrap: "nowrap",
        }}
      >
        <Grid item xs={12} containter className={classes.content}>
          <NavLink
            to={`/projects/${project._id}/board`}
            style={{
              textDecoration: "none",
              color: "#000",
            }}
          >
            <Typography
              style={{
                fontFamily: "Merriweather Sans",
                fontWeight: 600,
                flexWrap: "nowrap",
                overflow: "ellipse",
              }}
            >
              {project.title}
            </Typography>
          </NavLink>
          <Typography
            style={{
              fontFamily: "Merriweather Sans",
              flexWrap: "nowrap",
              overflow: "ellipse",
              fontSize: ".8rem",
              width: "100%",
              fontWeight: 200,
            }}
          >
            Task-management software
          </Typography>
        </Grid>
        <Grid
          container
          className={classes.footer}
          style={{
            alignSelf: "flex-end",
            maxHeight: "2rem",
            borderTop: "1px solid #bbb",
          }}
        >
          <Typography
            style={{
              fontFamily: "Merriweather Sans",
              fontSize: ".8rem",
              fontWeight: 200,
              padding: ".1rem",
              paddingLeft: ".4rem",
            }}
          >
            {project.columns.length} boards
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ProjectCard;
