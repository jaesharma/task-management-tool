import {
  Grid,
  Typography,
  makeStyles,
  Popper,
  Fade,
  Paper,
  Divider,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { MoreHorizontal } from "react-feather";

const useStyles = makeStyles((theme, props) => ({
  container: {
    background: "#fff",
    padding: "1rem",
    borderRadius: "4px",
    minHeight: "5rem",
    margin: "4px 0",
    width: "100%",
    transition: "all ease-in-out .2s",
    boxShadow: (props) =>
      props.index > 0
        ? "0px 16px 6px 5px #ddd, 0px 8px 16px -2px #ddd inset"
        : "0px 16px 6px 5px #ddd",

    "&:hover": {
      background: "#B3D4FF",
      cursor: "pointer",
    },
  },
  optionBtn: {
    padding: ".6rem",
    "&:hover": {
      background: "#efefef",
      cursor: "pointer",
    },
  },
}));

const TaskBlock = ({ task, provided, ...props }) => {
  const classes = useStyles({ index: props.index });
  const [showOptionsBtn, setShowOptionsBtn] = useState(false);
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    if (anchorEl) setOpen(true);
  }, [anchorEl]);

  return (
    <Grid
      container
      className={`${classes.container} ${task._id}`}
      ref={props.innerref}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      onMouseOver={() => setShowOptionsBtn(true)}
      onMouseLeave={() => {
        setOpen(false);
        setAnchorEl(null);
        setShowOptionsBtn(false);
      }}
    >
      <Popper open={open} anchorEl={anchorEl} placement="bottom-end" transition>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper>
              <Grid container direction="column" alignItems="flex-end">
                <Grid
                  className={classes.optionBtn}
                  onClick={() => props.removeTask(task._id)}
                >
                  <Typography
                    style={{
                      color: "red",
                      fontFamily: "Merriweather Sans",
                      fontSize: ".8rem",
                      fontWeight: 600,
                    }}
                  >
                    Delete
                  </Typography>
                  <Divider />
                </Grid>
              </Grid>
            </Paper>
          </Fade>
        )}
      </Popper>
      <Grid item xs={10}>
        <Typography
          style={{
            width: "100%",
            wordWrap: "break-word",
          }}
        >
          {task.summary}
        </Typography>
      </Grid>
      <Grid>
        {showOptionsBtn && (
          <MoreHorizontal
            onClick={(e) => {
              if (anchorEl) {
                setOpen(false);
                return setAnchorEl(null);
              }
              setAnchorEl(e.target);
            }}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default TaskBlock;
