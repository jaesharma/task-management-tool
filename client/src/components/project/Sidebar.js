import { Grid, Typography, makeStyles } from "@material-ui/core";
import React from "react";
import { NavLink } from "react-router-dom";

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
    transition: "all ease-in-out .2s",
    "&:hover": {
      backgroundColor: "#EBECF0",
      cursor: "pointer",
      borderRadius: "4px",
      paddingLeft: "8px",
    },
  },
  activeLink: {
    color: "blue",
  },
}));

const menus = [
  {
    icon: "/assets/kanban-icon.svg",
    label: "Board",
    link: "board",
  },
  {
    icon: "/assets/setting-icon.svg",
    label: "Project settings",
    link: "settings",
  },
];

const Sidebar = ({ project, url, active }) => {
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
        <NavLink
          to={`${url}/${menu.link}`}
          activeClassName={classes.activeLink}
          style={{
            textDecoration: "none",
          }}
        >
          <Grid container className={classes.menu}>
            <img
              src={menu.icon}
              alt={menu.label}
              className={classes.iconStyles}
            />
            <Typography
              className={classes.menuLabel}
              style={{
                color: active === menu.link ? "blue" : "",
              }}
            >
              {menu.label}
            </Typography>
          </Grid>
        </NavLink>
      ))}
    </Grid>
  );
};

export default Sidebar;
