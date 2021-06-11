import {
  Grid,
  Typography,
  makeStyles,
  Popper,
  Fade,
  Paper,
  Divider,
  CircularProgress,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { MoreHorizontal } from "react-feather";
import { useDispatch } from "react-redux";

const useStyles = makeStyles((theme, props) => ({
  container: {
    background: "#fff",
    padding: "3px",
    borderRadius: "4px",
    margin: "4px 0",
    width: "100%",
    transition: "all ease-in-out .2s",
    boxShadow: (props) =>
      props.index > 0
        ? "0px 6px 12px 5px #777, 0px 6px 12px -4px #777 inset"
        : "0px 16px 6px 5px #777",

    "&:hover": {
      background: "#B3D4FF",
      cursor: "pointer",
    },
  },
  subContainer: {
    minHeight: "4rem",
    padding: "8px",
    transition: "all ease-in-out .2s",
    "&:hover": {
      background: "#B3D4FF",
      cursor: "pointer",
    },
  },
  popper: {
    padding: ".3rem",
    width: "6rem",
  },
  optionBtn: {
    padding: ".4rem",
    "&:hover": {
      cursor: "pointer",
      backgroundColor: "#f1f5f7",
    },
  },
  disabled: {
    "&:hover": {
      cursor: "default",
      backgroundColor: "#fff",
    },
  },
}));

const TaskBlock = ({ task, provided, ...props }) => {
  const classes = useStyles({ index: props.index });
  const [showOptionsBtn, setShowOptionsBtn] = useState(false);
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [inAction, setInAction] = useState(false);

  useEffect(() => {
    if (anchorEl) setOpen(true);
  }, [anchorEl]);

  const handleClose = () => {
    setOpen(false);
    setInAction(false);
    setShowOptionsBtn(false);
    setAnchorEl(null);
  };

  const removeTaskHandler = () => {
    setOpen(false);
    setInAction(true);
    handleClose();
    props.removeTask(task._id);
  };

  const taskClickHandler = () => {
    props.showTask(task._id);
  };

  return (
    <Paper
      elevation={18}
      className={`${classes.container} ${task._id}`}
      ref={props.innerref}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      onMouseOver={() => setShowOptionsBtn(true)}
      onMouseLeave={() => handleClose()}
    >
      <Grid container className={`${classes.subContainer}`}>
        <Popper
          open={open}
          anchorEl={anchorEl}
          placement="bottom-end"
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={150}>
              <Paper elevation={14}>
                <Grid
                  container
                  direction="column"
                  alignItems="flex-end"
                  className={classes.popper}
                >
                  <Grid
                    container
                    className={`${classes.optionBtn} ${classes.disabled}`}
                  >
                    <Typography
                      style={{
                        fontFamily: "Merriweather Sans",
                        fontSize: ".8rem",
                        color: "#888",
                        fontWeight: 600,
                      }}
                    >
                      Actions
                    </Typography>
                  </Grid>
                  <Divider color="blue" style={{ width: "100%" }} />
                  <Grid container className={classes.optionBtn}>
                    <Typography
                      style={{
                        fontFamily: "Merriweather Sans",
                        fontSize: ".8rem",
                        fontWeight: 600,
                      }}
                      onClick={() => removeTaskHandler()}
                    >
                      Delete
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Fade>
          )}
        </Popper>

        <Grid item xs={10} onClick={() => taskClickHandler()}>
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
          {inAction && <CircularProgress size={18} color="secondary" />}

          {!inAction && showOptionsBtn && (
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
    </Paper>
  );
};

export default TaskBlock;
