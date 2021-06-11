import React, { useEffect, useState } from "react";
import {
  Slide,
  Dialog,
  Grid,
  Typography,
  makeStyles,
  Divider,
  Avatar,
  IconButton,
  LinearProgress,
} from "@material-ui/core";
import { useDispatch } from "react-redux";
import {
  getTaskById,
  updateTask,
} from "../../utility/utilityFunctions/apiCalls";
import { setModalStateAction } from "../../actions/modalActions";
import { Skeleton } from "@material-ui/lab";
import { Check, X } from "react-feather";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
  container: {
    minWidth: "45vw",
    minHeight: "40vh",
    background: "#fff",
    padding: "1rem",
    paddingTop: "2rem",
    overflowX: "hidden",
    flexWrap: "nowrap",
  },
  label: {
    fontSize: "1rem",
    fontWeight: 600,
    fontFamily: "Merriweather Sans",
    margin: ".3rem 0",
    marginTop: ".5rem",
  },
  boldText: {
    color: "#253858",
    fontFamily: "Merriweather Sans",
    fontSize: "1.4rem",
    marginBottom: "1rem",
    fontWeight: 600,
  },
  description: {
    fontSize: "1rem",
    fontWeight: 400,
    fontFamily: "Merriweather Sans",
    width: "100%",
    marginBottom: "1rem",
    wordWrap: "break-word",
    whiteSpace: "pre-line",
    transition: "all ease-in-out .2s",
    "&:hover": {
      background: "#dfe1e6",
    },
  },
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    margin: "0 .4rem",
  },
  row: {
    flexWrap: "nowrap",
    background: "#f1f6f4",
    margin: ".4rem 0",
    marginTop: "1rem",
  },
  input: {
    background: "#f1f5f7",
    border: "1px solid #eee",
    outline: "1px solid #777",
    borderRadius: "4px",
    padding: ".4rem 0",
    width: "100%",
    transition: "all ease-in-out .2s",
  },
  textArea: {
    background: "#f1f5f7",
    border: "1px solid #eee",
    outline: "1px solid #777",
    fontSize: "1rem",
    padding: ".2rem",
    borderRadius: "4px",
  },
  addDescription: {
    color: "#aaa",
  },
  iconBtn: {},
  actionBtn: {
    alignSelf: "flex-end",
    flexWrap: "nowrap",
    background: "#fff",
    position: "sticky",
    top: 0,
    borderRadius: "4px",
    boxShadow: "4px 4px 8px 4px #eee",
    transition: "all ease-in-out .2s",
    "&:hover": {
      boxShadow: "4px 4px 2px 4px #eee",
    },
  },
}));

const TaskDialog = ({ id, open, handleClose, ...props }) => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const [task, setTask] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [text, setText] = useState("");

  const changeHandler = (e) => {
    setText(e.target.value);
  };

  useEffect(() => {
    getTaskById(id)
      .then((resp) => {
        setTask(resp.data.task);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
        if (error.response?.data?.error)
          return dispatch(
            setModalStateAction({
              showModal: true,
              text: error.response.data.error,
              severity: "error",
            })
          );
        return dispatch(
          setModalStateAction({
            showModal: true,
            text: `Something went wrong`,
            severity: "error",
          })
        );
      });
  }, []);

  const startEditing = (edit) => {
    setText(task[edit] || "");
    setEditing(edit);
  };

  const cancelEditing = () => {
    setTimeout(() => {
      setEditing(null);
      setText("");
    }, 500);
  };

  const update = (e) => {
    e.stopPropagation();
    setUpdating(true);
    const updates = {
      [editing]: text,
    };
    const args = {
      id: task._id,
      updates,
    };
    updateTask(args)
      .then((resp) => {
        setUpdating(false);
        const { task } = resp.data;
        setTask(task);
        props.fetchAndSetProject();
      })
      .catch((error) => {
        console.log(error);
        setUpdating(false);
        if (error.response?.data?.error)
          return dispatch(
            setModalStateAction({
              showModal: true,
              text: error.response.data.error,
              severity: "error",
            })
          );
        return dispatch(
          setModalStateAction({
            showModal: true,
            text: `Something went wrong`,
            severity: "error",
          })
        );
      });
  };

  return (
    <div>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        BackdropProps={{
          style: {
            background: "rgba(120,134,153,.3)",
          },
        }}
      >
        {updating && <LinearProgress />}
        <Grid container direction="column" className={classes.container}>
          {editing && (
            <Grid item xs={2} container className={classes.actionBtn}>
              <IconButton className={classes.iconBtn}>
                <Check name="update" size={18} onClick={(e) => update(e)} />
              </IconButton>
              <IconButton className={classes.iconBtn}>
                <X size={18} />
              </IconButton>
            </Grid>
          )}
          <Typography
            className={classes.boldText}
            onDoubleClick={() => startEditing("summary")}
          >
            {loading ? (
              <Skeleton width="100%" height={80} />
            ) : editing === "summary" ? (
              <input
                value={text}
                onChange={changeHandler}
                className={`${classes.input} ${classes.boldText}`}
                autoFocus
                onBlur={() => cancelEditing()}
              />
            ) : (
              task.summary
            )}
          </Typography>
          <Typography className={classes.label}>Description</Typography>
          {loading ? (
            <Skeleton width="100%" height={80} />
          ) : editing === "description" ? (
            <textarea
              value={text}
              onChange={changeHandler}
              className={classes.textArea}
              onBlur={() => cancelEditing()}
              autoFocus
            />
          ) : !task.description?.length ? (
            <Typography
              className={classes.addDescription}
              onClick={() => startEditing("description")}
            >
              Add a description
            </Typography>
          ) : (
            <Typography
              className={classes.description}
              onDoubleClick={() => startEditing("description")}
            >
              {task.description}
            </Typography>
          )}
          <Divider style={{ minWidth: "100%" }} />
          <Grid container alignItems="center" className={classes.row}>
            <Grid item xs={3} container>
              <Typography className={classes.label}>reported by:</Typography>
            </Grid>
            <Grid
              item
              xs={10}
              container
              alignItems="center"
              style={{ marginLeft: "1rem" }}
            >
              {loading ? (
                <Skeleton width="100%" height="4rem" />
              ) : (
                <>
                  <Avatar
                    src={task.reporter.avatar}
                    className={classes.avatar}
                  />
                  <Typography>{task.reporter.name}</Typography>
                </>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Dialog>
    </div>
  );
};

export default TaskDialog;
