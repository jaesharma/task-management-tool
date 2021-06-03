import React, { useEffect, useState } from "react";
import {
  makeStyles,
  Button,
  Dialog,
  IconButton,
  Typography,
  Slide,
  Grid,
  CircularProgress,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import {
  setModalStateAction,
  setStaticModalAction,
} from "../../actions/modalActions";
import { useDispatch, useSelector } from "react-redux";
import { setCreateProjectDialogAction } from "../../actions/dialogActions";
import { createProject } from "../../utility/utilityFunctions/apiCalls";
import { useHistory } from "react-router";
import keygen from "keygenerator";

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: "relative",
  },
  title: {
    marginLeft: theme.spacing(2),
    fontFamily: "Merriweather sans",
    fontWeight: 600,
    flex: 1,
  },
  formContainer: {
    marginTop: "2rem",
    maxWidth: "40%",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    flexWrap: "nowrap",
  },
  label: {
    color: "#949DA8",
    fontWeight: 600,
    fontFamily: "Merriweather sans",
    marginTop: ".7rem",
  },
  btnStyles: {
    textTransform: "none",
    backgroundColor: "#3352CC",
    marginRight: ".4rem",
    fontFamily: "Merriweather sans",
    fontWeight: 600,
  },
  btnRow: {
    marginTop: "1.5rem",
  },
  inputBox: {
    backgroundColor: "#ebeef5",
    fontFamily: "Merriweather sans",
    border: "none",
    outline: "none",
    fontSize: ".9rem",
    padding: ".4rem",
    fontWeight: 100,
    marginTop: ".3rem",
    border: "1px solid #ebeef5",
    transition: "all ease-in-out .3s",
    "&:focus": {
      border: "1px solid blue",
      background: "#fff",
    },
    "&:hover": {
      background: "#eee",
    },
  },
  iconImg: {
    width: "80%",
  },
  solidTitle: {
    fontFamily: "Merriweather sans",
    fontWeight: 600,
  },
  para: {
    fontFamily: "Merriweather sans",
    color: "#666",
    fontSize: ".9rem",
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="right" ref={ref} {...props} />;
});

const CreateProjectDialog = () => {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const open = useSelector(
    (state) => state.dialogReducer.showCreateProjectDialog
  );
  const [creating, setCreating] = useState(false);
  const [formValues, setFormValues] = useState({
    title: "",
    key: keygen.session_id({ length: 4, forceUppercase: true }),
  });

  useEffect(() => {
    setFormValues({
      ...formValues,
      key: keygen._({ length: 4, forceUppercase: true }),
    });
  }, [open]);

  const changeHandler = (e) => {
    let { name, value } = e.target;
    if (name === "key") {
      value = value.toUpperCase().trim();
    }
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setFormValues({ title: "" });
    dispatch(setCreateProjectDialogAction(false));
  };

  const submitHandler = (e) => {
    e.preventDefault();
    setCreating(true);
    createProject({ title: formValues.title, key: formValues.key })
      .then((resp) => {
        const { project } = resp.data;
        dispatch(
          setModalStateAction({
            showModal: true,
            text: "Project created successfully!",
            severity: "success",
          })
        );
        setCreating(false);
        handleClose();
        history.push(`/projects/${project._id}/boards`);
      })
      .catch((error) => {
        setCreating(false);
        dispatch(setStaticModalAction({ showStaticModal: false, text: "" }));
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
            text: "Something went wrong. Try again later.",
            severity: "error",
          })
        );
      });
  };

  return (
    <div>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <Grid container direction="column" alignItems="center" style={{}}>
          <div
            style={{
              position: "absolute",
              top: "4%",
              left: "4%",
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </div>
          <Grid container direction="column" className={classes.formContainer}>
            <Grid
              container
              style={{
                marginBottom: "1rem",
              }}
            >
              <Typography
                variant="h5"
                style={{
                  fontWeight: 600,
                }}
              >
                Create Project
              </Typography>
            </Grid>
            <form className={classes.form} onSubmit={submitHandler}>
              <label htmlFor="title" className={classes.label}>
                Project title*
              </label>
              <input
                id="title"
                name="title"
                placeholder="Enter a project title"
                className={classes.inputBox}
                value={formValues.title}
                onChange={changeHandler}
                required
              />
              <label htmlFor="key" className={classes.label}>
                Key*
              </label>
              <input
                id="key"
                name="key"
                className={classes.inputBox}
                value={formValues.key}
                onChange={changeHandler}
                required
              />
              <Typography
                className={classes.label}
                style={{
                  fontSize: ".9rem",
                  marginTop: "2rem",
                }}
              >
                Template
              </Typography>
              <Grid
                container
                style={{
                  margin: "1rem 0",
                  marginTop: ".8rem",
                }}
              >
                <Grid
                  item
                  xs={4}
                  container
                  justify="center"
                  alignItems="center"
                >
                  <img src="/assets/kanban.svg" className={classes.iconImg} />
                </Grid>
                <Grid item xs={8}>
                  <Typography className={classes.solidTitle}>Kanban</Typography>
                  <Typography className={classes.para}>
                    Monitor work in a continuous flow for agile teams. Suits
                    teams who control work volume from a backlog.
                  </Typography>
                </Grid>
              </Grid>
              <Grid container className={classes.btnRow}>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  className={classes.btnStyles}
                  disableElevation
                  style={{
                    color: "white",
                    padding: ".2rem .4rem",
                  }}
                  disabled={
                    !!!formValues.title.trim() ||
                    !!!formValues.key.trim() ||
                    creating
                  }
                >
                  {creating ? (
                    <CircularProgress size={16} />
                  ) : (
                    <Typography>Create</Typography>
                  )}
                </Button>
                <Button
                  onClick={() => handleClose()}
                  className={classes.btnStyles}
                  style={{
                    backgroundColor: "#F2F3F5",
                    color: "#6b7f97",
                  }}
                >
                  Cancel
                </Button>
              </Grid>
            </form>
          </Grid>
        </Grid>
      </Dialog>
    </div>
  );
};

export default CreateProjectDialog;
