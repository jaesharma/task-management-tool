import { Grid, Typography, makeStyles } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles((theme) => ({
  container: {
    background: "#fff",
    padding: "1rem",
    borderRadius: "4px",
    minHeight: "5rem",
    margin: "4px 0",
    width: "100%",
    transition: "all ease-in-out .2s",
    boxShadow: "0px 0px 12px 1px #eee",
    "&:hover": {
      background: "#B3D4FF",
      cursor: "pointer",
    },
  },
}));

const TaskBlock = ({ task, provided, ...props }) => {
  const classes = useStyles();
  return (
    <Grid
      container
      className={`${classes.container} ${task._id}`}
      ref={props.innerref}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
    >
      <Typography
        style={{
          width: "100%",
          wordWrap: "break-word",
        }}
      >
        {task.summary}
      </Typography>
    </Grid>
  );
};

export default TaskBlock;
