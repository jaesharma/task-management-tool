import { Grid, Typography, makeStyles } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles((theme) => ({
  iconStyles: {
    stroke: "red",
    fill: "green",
  },
  menuLabel: {
    color: "#425776",
    paddingLeft: ".8rem",
    fontFamily: "Merriweather Sans",
  },
  projectIcon: {
    width: "100%",
    borderRadius: "3px",
  },
  menu: {
    padding: ".4rem 0",
    transition: 'all ease-in-out .2s',
    "&:hover": {
      backgroundColor: "#EBECF0",
      cursor: "pointer",
      borderRadius: "4px",
      paddingLeft: "8px"
    },
  },
}));

const menus = [
  {
    icon: "/assets/kanban-icon.svg",
    label: "Board",
  },
  {
    icon: "/assets/setting-icon.svg",
    label: "Project settings",
  },
];

const Sidebar = ({ project }) => {
  const classes = useStyles();
  return (
    <Grid
      container
      direction="column"
      style={{
        padding: "2rem 1rem 1rem 1rem",
      }}
    >
      <Grid
        container
        style={{
          flexWrap: "nowrap",
          paddingBottom: "1rem",
        }}
      >
        <Grid item xs={2} container>
          <img
            src={project.icon}
            alt="project-icon"
            className={classes.projectIcon}
          />
        </Grid>
        <Grid
          item
          xs={10}
          container
          style={{
            paddingLeft: "1rem",
          }}
        >
          <Typography
            style={{
              fontFamily: "Merriweather Sans",
            }}
          >
            {project.title}
          </Typography>
        </Grid>
      </Grid>
      {menus.map((menu) => (
        <Grid container className={classes.menu}>
          <img
            src={menu.icon}
            alt={menu.label}
            className={classes.iconStyles}
          />
          <Typography className={classes.menuLabel}>{menu.label}</Typography>
        </Grid>
      ))}
    </Grid>
  );
};

export default Sidebar;
