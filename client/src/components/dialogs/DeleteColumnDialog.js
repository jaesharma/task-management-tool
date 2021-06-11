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
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { deleteColumn } from "../../utility/utilityFunctions/apiCalls";
import { setModalStateAction } from "../../actions/modalActions";
import { useDispatch } from "react-redux";

const useStyles = makeStyles((theme) => ({
  container: {
    maxWidth: "32rem",
    minWidth: "32rem",
    padding: "1rem",
  },
  dialog: {
    position: "absolute",
    top: 50,
  },
  title: {
    color: "#888",
    marginLeft: ".2rem",
  },
  btnStyles: {
    textTransform: "none",
    marginRight: ".4rem",
    fontFamily: "Merriweather sans",
    fontWeight: 600,
  },
  deleteBtn: {
    backgroundColor: "#de350b",
    "&:hover": {
      backgroundColor: "#de350b",
    },
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

const DeleteColumnDialog = ({
  show,
  setShowDeleteColumnDialog,
  columns,
  column,
  ...props
}) => {
  const classes = useStyles();
  const [deleting, setDeleting] = useState(false);
  const [selectedCol, setSelectedCol] = useState(columns[0]._id);
  const dispatch = useDispatch();

  const handleChange = (event) => {
    setSelectedCol(event.target.value);
  };

  const handleClose = () => {
    setShowDeleteColumnDialog(false);
    props.closePopper();
  };

  const deleteHandler = () => {
    setDeleting(true);
    deleteColumn({ deleteColumnId: column._id, shiftToColumnId: selectedCol })
      .then((_resp) => {
        setDeleting(false);
        props.fetchAndSetProject();
        handleClose();
      })
      .catch((error) => {
        setDeleting(false);
        handleClose();
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
        <Typography className={classes.heading}>
          Before you delete{" "}
          <span className={classes.title}>{column.title.toUpperCase()}</span>
        </Typography>
        <Typography className={classes.text}>
          Where would you like to move the issues in this column? Any issues in
          your backlog with the {column.title.toUpperCase()} status will also
          inherit this status.
        </Typography>
        <FormControl variant="filled" className={classes.formControl}>
          <InputLabel id="demo-simple-select-filled-label">
            Select Column
          </InputLabel>
          <Select
            labelId="demo-simple-select-filled-label"
            id="demo-simple-select-filled"
            value={selectedCol}
            onChange={handleChange}
          >
            {columns
              .filter((col) => col._id !== column._id)
              .map((col) => (
                <MenuItem value={col._id}>{col.title}</MenuItem>
              ))}
          </Select>
        </FormControl>
        <Grid container justify="flex-end" className={classes.btns}>
          <Button
            color="primary"
            variant="contained"
            disableElevation
            onClick={() => {
              deleteHandler();
            }}
            className={`${classes.btnStyles} ${classes.deleteBtn}`}
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={15} /> : "Delete"}
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

export default DeleteColumnDialog;
