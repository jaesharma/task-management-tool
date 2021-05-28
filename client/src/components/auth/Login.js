import React, { useEffect, useState } from "react";
import {
  Grid,
  Hidden,
  makeStyles,
  TextField,
  Typography,
  Button,
  CircularProgress,
} from "@material-ui/core";
import axios from "../../utility/axios/apiInstance";
import { NavLink, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { loginAction } from "../../actions/authActions";
import { setModalStateAction } from "../../actions/modalActions";

const useStyles = makeStyles((theme) => ({
  loginFormContainer: {
    padding: "10%",
  },
  fieldRow: {
    marginBottom: "1rem",
  },
  actionFields: {
    marginBottom: ".8rem",
  },
  link: {
    color: "gray",
    textDecoration: "none",
    "&:hover": {
      color: "blue",
      cursor: "pointer",
    },
  },
}));

const Login = (props) => {
  const classes = useStyles();
  const [formFields, setFormFields] = useState({
    email: "",
    password: "",
  });
  const [loggingIn, setLoggingIn] = useState(false);
  const [authOf, setAuthOf] = useState("");

  useEffect(() => {
    if (props.location.pathname === "/admin/login") {
      setAuthOf("admin");
    }
    if (props.location.pathname === "/user/login") {
      setAuthOf("user");
    }
  }, []);

  const fieldChangeHandler = (e) => {
    setFormFields((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const login = (e) => {
    e.preventDefault();
    setLoggingIn(true);
    const url = authOf === "admin" ? `/${authOf}/login` : `/users/login`;
    axios
      .post(url, formFields)
      .then((resp) => {
        const { token, user: profile } = resp.data;
        console.log("resp: ", resp.data);
        props.login(token, profile, authOf);
        setLoggingIn(false);
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.error)
          props.setModalState(true, error.response.data.error, "error");
        else props.setModalState(true, "Something went wrong!", "error");
        setLoggingIn(false);
      });
  };
  return (
    <Grid
      container
      direction="row"
      style={{
        maxHeight: "97vh",
        minHeight: "97vh",
        overflow: "hidden",
      }}
    >
      {props.isAuthenticated && <Redirect to="/" />}
      <Grid
        item
        xs={12}
        sm={6}
        container
        direction="column"
        justify="center"
        className={classes.loginFormContainer}
      >
        <Typography variant="h6" color="textSecondary">
          Welcome Back
        </Typography>
        <Typography variant="h4" className={classes.fieldRow}>
          Login to
          {authOf === "admin" ? (
            <span
              style={{
                color: "gray",
                fontWeight: 600,
                marginLeft: ".4rem",
              }}
            >
              Admin Panel
            </span>
          ) : (
            <span> your account</span>
          )}
        </Typography>
        <form onSubmit={login}>
          <TextField
            autoComplete="email"
            id="email"
            name="email"
            label="email"
            type="email"
            variant="outlined"
            fullWidth
            required
            autoFocus
            value={formFields.email}
            placeholder="ex: example@gmail.com"
            className={classes.fieldRow}
            onChange={fieldChangeHandler}
          />
          <TextField
            id="email"
            label="password"
            name="password"
            type="password"
            required
            value={formFields.password}
            fullWidth
            autoComplete="new-password"
            autoFill="off"
            variant="outlined"
            className={classes.fieldRow}
            onChange={fieldChangeHandler}
          />
          {authOf === "admin" && (
            <Grid
              container
              justify="flex-end"
              alignItems="center"
              className={classes.actionFields}
            >
              <NavLink to="/forgotpass" className={classes.link}>
                Forgot password?
              </NavLink>
            </Grid>
          )}
          <Button
            variant="contained"
            color="secondary"
            className={classes.fieldRow}
            disabled={loggingIn}
            fullWidth
            type="submit"
          >
            {loggingIn ? (
              <CircularProgress size={30} color="#fff" />
            ) : (
              <Typography style={{ margin: ".2rem" }}>Login</Typography>
            )}
          </Button>
        </form>
      </Grid>
      <Hidden xsDown>
        <Grid
          item
          xs={6}
          container
          direction="column"
          alignItems="center"
          justify="center"
          className={classes.svgStyles}
        >
          <img src={`/assets/task.svg`} alt="svg" width="100%" />
        </Grid>
      </Hidden>
    </Grid>
  );
};

const mapStateToProps = (state) => {
  return {
    isAuthenticated: state.authReducer.isAuthenticated,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    login: (token, profile, as) => {
      dispatch(loginAction(token, profile, as));
    },
    setModalState: (modalState, text, severity) =>
      dispatch(setModalStateAction({ showModal: modalState, text, severity })),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
