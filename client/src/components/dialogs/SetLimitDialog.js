import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import Slide from "@material-ui/core/Slide";
import {
  Grid,
  Typography,
  makeStyles,
  CircularProgress,
} from "@material-ui/core";
import { setColumnLimit } from "../../utility/utilityFunctions/apiCalls";
import { setModalStateAction } from "../../actions/modalActions";
import { useDispatch } from "react-redux";

const useStyles = makeStyles((theme) => ({
  container: {
    maxWidth: "22rem",
    minWidth: "22rem",
    padding: "1rem",
  },
  dialog: {
    position: "absolute",
    top: 50,
  },
  btnStyles: {
    textTransform: "none",
    backgroundColor: "#3352CC",
    marginRight: ".4rem",
    fontFamily: "Merriweather sans",
    fontWeight: 600,
  },
  heading: {
    fontSize: "1.2rem",
    fontWeight: 600,
    color: "#444",
    fontFamily: "Merriweather Sans",
    margin: ".4rem 0",
    marginBottom: "1rem",
  },
  input: {
    backgroundColor: "#ebeef5",
    border: "none",
    outline: "none",
    padding: ".4rem",
    fontWeight: 100,
    marginBottom: ".6rem",
    transition: "all ease-in-out .3s",
    "&:focus": {
      border: "1px solid blue",
      background: "#fff",
    },
    "&:hover": {
      background: "#eee",
    },
  },
  label: {
    marginBottom: "8px",
    fontWeight: 600,
    color: "#444",
    fontFamily: "Merriweather Sans",
  },
  text: {
    fontWeight: 400,
    color: "#666",
    fontFamily: "Merriweather Sans",
    margin: ".4rem 0",
    marginBottom: "1rem",
  },
  btns: {
    marginTop: "1rem",
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const SetLimitDialog = ({ show, setShowSetLimitDialog, column, ...props }) => {
  const [limit, setLimit] = useState(column.limit);
  const [saving, setSaving] = useState(false);
  const classes = useStyles();
  const dispatch = useDispatch();

  const handleClose = () => {
    setLimit(null);
    setShowSetLimitDialog(false);
  };

  const setLimitHandler = () => {
    setSaving(true);
    setColumnLimit({ limit, colId: column._id })
      .then((resp) => {
        setSaving(false);
        const { column } = resp.data;
        props.updateColumn(column);
        handleClose();
        props.closePopper();
      })
      .catch((error) => {
        setSaving(false);
        console.log(error);
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

  const limitChangeHandler = (e) => {
    if (isNaN(e.target.value)) return;
    setLimit(e.target.value);
  };

  return (
    <Dialog
      open={show}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      classes={{
        paper: classes.dialog,
      }}
      BackdropProps={{
        style: {
          background: "rgba(120,134,153,.5)",
        },
      }}
    >
      <Grid container direction="column" className={classes.container}>
        <Typography className={classes.heading}>Column limit</Typography>
        <Typography className={classes.text}>
          We'll highlight this column if the number of issues in it passes this
          limit.
        </Typography>
        <label htmlFor="limit-input" className={classes.label}>
          Maximum tasks
        </label>
        <input
          id="limit-input"
          placeholder="No limit set"
          value={limit}
          className={classes.input}
          onChange={limitChangeHandler}
          disabled={saving}
          autoFocus
        />
        <Grid container justify="flex-end" className={classes.btns}>
          <Button
            color="primary"
            variant="contained"
            disableElevation
            onClick={() => {
              setLimitHandler();
            }}
            className={classes.btnStyles}
            disabled={saving}
          >
            {saving ? <CircularProgress size={15} /> : "Save"}
          </Button>
          <Button
            disableElevation
            className={classes.btnStyles}
            style={{
              backgroundColor: "#F2F3F5",
            }}
            onClick={() => {
              handleClose();
            }}
          >
            Cancel
          </Button>
        </Grid>
      </Grid>
    </Dialog>
  );
};

export default SetLimitDialog;
