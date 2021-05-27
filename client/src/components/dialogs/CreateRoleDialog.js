import React, { useState } from "react";
import {
  makeStyles,
  FormControlLabel,
  Checkbox,
  Grid,
  CircularProgress,
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Slide from "@material-ui/core/Slide";
import { Typography } from "@material-ui/core";
import { createUserRole } from "../../utility/utilityFunctions/apiCalls";
import { setModalStateAction } from "../../actions/modalActions";
import { useDispatch } from "react-redux";

const useStyles = makeStyles((theme) => ({
  title: {
    fontSize: "1.1rem",
    fontWeight: 600,
    fontFamily: "Merriweather sans",
  },
  inputBox: {
    backgroundColor: "#ebeef5",
    border: "none",
    outline: "none",
    fontSize: "1.2rem",
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
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CreateRoleDialog = ({ open, handleClose, addRole }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [fieldValues, setFieldValues] = useState({
    title: "",
    permissions: {
      CREATE_PROJECTS: false,
      CREATE_TEAM: false,
    },
  });

  const createRoleHandler = (e) => {
    e.preventDefault();
    setLoading(true);
    let { title, permissions } = fieldValues;
    permissions = Object.keys(permissions).filter(
      (permission) => fieldValues.permissions[permission]
    );
    createUserRole({ title, permissions })
      .then((resp) => {
        setLoading(false);
        const { role } = resp.data;
        addRole(role);
        dispatch(
          setModalStateAction({
            showModal: true,
            text: `A new role titled ${role.title} created.`,
            severity: "success",
          })
        );
        handleClose();
      })
      .catch((error) => {
        setLoading(false);
        if (error.response && error.response.data.error)
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
            text: "Something went wrong. Try again later.",
            severity: "error",
          })
        );
      });
  };

  const fieldChangeHandler = (e) => {
    const { name, value, checked } = e.target;
    setFieldValues((values) => {
      if (name === "title") return { ...values, title: value };
      return {
        ...values,
        permissions: { ...values.permissions, [name]: checked },
      };
    });
  };
  return (
    <div>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
      >
        <DialogTitle
          id="alert-dialog-slide-title"
          style={{ marginBottom: "-1rem" }}
        >
          <Typography
            variant="h5"
            style={{
              fontFamily: "Merriweather sans",
              color: "#333",
              margin: 0,
            }}
          >
            Create user role
          </Typography>
        </DialogTitle>
        <form onSubmit={createRoleHandler}>
          <DialogContent>
            <Typography className={classes.title}>Role title</Typography>
            <input
              autoFocus
              type="text"
              id="title"
              name="title"
              className={classes.inputBox}
              value={fieldValues.title}
              onChange={fieldChangeHandler}
              required
            />
            <Grid container direction="column">
              <Typography className={classes.title}>Permissions</Typography>
              {Object.keys(fieldValues.permissions).map((permission, index) => {
                return (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={fieldValues.permissions[permission]}
                        onChange={fieldChangeHandler}
                        name={permission}
                      />
                    }
                    label={permission.replace("_", " ").toLowerCase()}
                  />
                );
              })}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              Cancel
            </Button>
            <Button type="submit" color="primary">
              {loading ? (
                <CircularProgress size={18} />
              ) : (
                <Typography>Add</Typography>
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};

export default CreateRoleDialog;
