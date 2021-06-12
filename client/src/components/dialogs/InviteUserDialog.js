import React, { useEffect, useState } from "react";
import {
  makeStyles,
  Button,
  Dialog,
 IconButton,
  Typography,
  Slide,
  Grid,
  Select,
  MenuItem,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import {
  getUserRoles,
  inviteUser,
} from "../../utility/utilityFunctions/apiCalls";
import {
  setModalStateAction,
  setStaticModalAction,
} from "../../actions/modalActions";
import { connect } from "react-redux";

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: "relative",
  },
  title: {
    marginLeft: theme.spacing(2),
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
    marginTop: ".7rem",
  },
  inputBox: {
    backgroundColor: "#ebeef5",
    border: "none",
    outline: "none",
    fontSize: "1.2rem",
    padding: ".4rem",
    fontWeight: 100,
    marginTop: ".3rem",
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
  return <Slide direction="right" ref={ref} {...props} />;
});

const InviteUserDialog = ({ open, handleClose, ...props }) => {
  const classes = useStyles();
  const [roles, setRoles] = useState([]);
  const [inviting, setInviting] = useState(false);
  const [formValues, setFormValues] = useState({
    email: "",
    role: {},
  });

  useEffect(() => {
    getUserRoles()
      .then((resp) => {
        setRoles(resp.data.roles);
      })
      .catch((error) => {
        console.log("error: ", error);
      });
  }, []);

  const changeHandler = (e) => {
    setFormValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitHandler = (e) => {
    e.preventDefault();
    setInviting(true);
    props.setStaticModal(true, "Generating new credentials...");
    const { email, role } = formValues;
    inviteUser(email, role._id)
      .then((resp) => {
        setInviting(false);
        props.setStaticModal(false, "");
        props.setModalState(true, "New credentails sent to user.", "success");
        handleClose();
      })
      .catch((error) => {
        setInviting(false);
        props.setStaticModal(false, "");
        if (error.response && error.response.data && error.response.data.error)
          return props.setModalState(true, error.response.data.error, "error");
        props.setModalState(
          true,
          "Something went wrong. Try again later.",
          "error"
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
                Invite user
              </Typography>
            </Grid>
            <form className={classes.form} onSubmit={submitHandler}>
              <label htmlFor="email-input" className={classes.label}>
                Email address*
              </label>
              <input
                type="email"
                id="email-input"
                name="email"
                placeholder="ex: example@mail.com"
                className={classes.inputBox}
                value={formValues.email}
                onChange={changeHandler}
                required
              />
              <label htmlFor="role" className={classes.label}>
                Role
              </label>
              <Select
                labelId="demo-customized-select-label"
                id="demo-customized-select"
                value={formValues.role.title}
                name="role"
                onChange={changeHandler}
                required
              >
                {roles.map((role) => (
                  <MenuItem value={role}>
                    <Grid
                      container
                      direction="column"
                      style={{
                        paddingLeft: ".8rem",
                      }}
                    >
                      <Typography
                        style={{
                          fontWeight: 600,
                        }}
                      >
                        {role.title}
                      </Typography>
                      <Typography>
                        will have permission to{" "}
                        {role.permissions
                          .map((p) => p.toLowerCase().replace("_", " "))
                          .join(",")}
                      </Typography>
                    </Grid>
                  </MenuItem>
                ))}
              </Select>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                style={{
                  marginTop: "1rem",
                }}
                disabled={inviting}
              >
                Invite user
              </Button>
            </form>
          </Grid>
        </Grid>
      </Dialog>
    </div>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    setModalState: (modalState, text, severity) =>
      dispatch(setModalStateAction({ showModal: modalState, text, severity })),

    setStaticModal: (modalState, text) =>
      dispatch(setStaticModalAction({ showStaticModal: modalState, text })),
  };
};

export default connect(null, mapDispatchToProps)(InviteUserDialog);
