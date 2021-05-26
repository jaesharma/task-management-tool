import React, { useEffect, useState, useRef } from "react";
import {
  Grid,
  makeStyles,
  TextField,
  Button,
  Typography,
  Hidden,
} from "@material-ui/core";
import axios from "../../utility/axios/apiInstance";
import { loginAdminAction } from "../../actions/authActions";
import { connect } from "react-redux";
import { setModalStateAction } from "../../actions/modalActions";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  pageContainer: {
    minHeight: "96vh",
    maxHeight: "96vh",
    minWidth: "96vw",
  },
  backgroundStyles: {
    position: "absolute",
    top: 0,
    left: 0,
    minWidth: "100%",
    height: "50%",
    backgroundSize: "cover",
    background: "url('/assets/wave.svg')",
    overflow: "hidden",
    backgroundRepeat: "no-repeat",
    transition: "all ease-in-out .8s",
    [theme.breakpoints.down("sm")]: {
      height: "100%",
    },
  },
  contentCard: {
    maxWidth: "60%",
    maxHeight: "20%",
    overflow: "hidden",
    marginTop: "8rem",
    zIndex: 2,
    background: "white",
    boxShadow: "4px 14px 14px 4px gray",
    flexWrap: "nowrap",
    [theme.breakpoints.down("sm")]: {
      maxWidth: "90%",
      marginTop: "14rem",
    },
  },
  formContainer: {
    borderLeft: "1px solid",
    padding: "1rem",
    [theme.breakpoints.down("xs")]: {
      border: "none",
    },
  },
  fieldRow: {
    marginBottom: ".8rem",
  },
}));

const AbsoluteBackground = () => {
  const classes = useStyles();
  return <div className={classes.backgroundStyles}></div>;
};

const ForgotPasswordPage = (props) => {
  const classes = useStyles();
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [fieldValues, setFieldValues] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const otpRef = useRef();
  const history = useHistory();

  const verifyOtp = () => {
    axios
      .post("/admin/verifyotp", {
        email: fieldValues.email,
        otp: fieldValues.otp,
      })
      .then((resp) => {
        const { token, profile } = resp.data;
        props.loginAdmin(token, profile);
        setOtpVerified(true);
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.error)
          props.setModalState(true, error.response.data.error, "error");
        else props.setModalState(true, "Something went wrong!", "error");
      });
  };

  const changePassword = () => {
    const { newPassword, confirmNewPassword } = fieldValues;
    if (newPassword !== confirmNewPassword)
      return props.setModalState(true, "Password does not match", "error");
    const configs = {
      headers: {
        authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    };
    axios
      .post("/admin/changepassword", { password: newPassword }, configs)
      .then((_resp) => {
        props.setModalState(true, "Password Changed!", "success");
        history.replace("/cpanel");
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.error)
          props.setModalState(true, error.response.data.error, "error");
        else props.setModalState(true, "Something went wrong!", "error");
      });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (props.isAuthenticated) {
      return changePassword();
    } else if (!otpSent) {
      axios
        .post("/admin/sendotp", {
          to: fieldValues.email,
        })
        .then((resp) => {
          setOtpSent(true);
          props.setModalState(
            true,
            "OTP sent. Valid for only 5 minutes.",
            "info"
          );
        })
        .catch((error) => {
          if (
            error.response &&
            error.response.data &&
            error.response.data.error
          )
            props.setModalState(true, error.response.data.error, "error");
          else props.setModalState(true, "Something went wrong!", "error");
        });
    } else if (!otpVerified) {
      return verifyOtp();
    }
  };

  useEffect(() => {
    if (otpRef.current) otpRef.current.focus();
  }, [otpSent]);

  const fieldChangeHandler = (e) => {
    if (e.target.name === "otp") {
      if (isNaN(e.target.value) || e.target.value.length > 6) return;
    }
    setFieldValues((prevValues) => ({
      ...prevValues,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      className={classes.pageContainer}
    >
      <AbsoluteBackground />
      <Grid container direction="row" className={classes.contentCard}>
        <Hidden xsDown>
          <Grid
            item
            xs={4}
            container
            style={{
              maxHeight: "100%",
              maxWidth: "100%",
            }}
          >
            <img
              src="/assets/forgotpass.svg"
              heigth="4rem"
              alt="forgot-pass-svg"
              style={{
                maxHeight: "24rem",
              }}
            />
          </Grid>
        </Hidden>
        <Grid
          item
          xs={12}
          sm={8}
          container
          alignItems="center"
          className={classes.formContainer}
        >
          {!props.isAuthenticated && (
            <>
              <Typography variant="h4" style={{}}>
                Trouble Logging In?
              </Typography>
              <Typography varaint="h6" color="textSecondary">
                Enter your email and we'll send you OTP to get back to your
                account.
              </Typography>
              <form onSubmit={submitHandler}>
                <TextField
                  autoComplete="email"
                  id="email"
                  name="email"
                  label="email"
                  type="email"
                  value={fieldValues.email}
                  variant="outlined"
                  fullWidth
                  required
                  autoFocus
                  disabled={otpSent}
                  placeholder="ex: example@gmail.com"
                  className={classes.fieldRow}
                  onChange={fieldChangeHandler}
                />
                <TextField
                  autoComplete="otp"
                  id="otp"
                  name="otp"
                  label="OTP"
                  variant="outlined"
                  fullWidth
                  inputRef={otpRef}
                  required
                  disabled={!otpSent}
                  value={fieldValues.otp}
                  className={classes.fieldRow}
                  onChange={fieldChangeHandler}
                />
                {!otpSent && (
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    color="primary"
                    className={classes.fieldRow}
                  >
                    Send OTP
                  </Button>
                )}
                {otpSent && (
                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    autoFocus
                    fullWidth
                    className={classes.fieldRow}
                    disabled={fieldValues.otp.length < 6}
                  >
                    Verity
                  </Button>
                )}
              </form>
            </>
          )}
          {props.isAuthenticated && (
            <form onSubmit={submitHandler}>
              <Grid container justify="center">
                <Typography variant="h5" color="secondary">
                  Verified
                </Typography>
              </Grid>
              <Grid
                container
                justify="center"
                style={{
                  marginBottom: ".6rem",
                }}
              >
                <Typography variant="h6" color="textSecondary">
                  Choose Strong Password
                </Typography>
              </Grid>
              <TextField
                autoComplete="new-password"
                id="new-password"
                name="newPassword"
                label="new password"
                type="password"
                value={fieldValues.newPassword}
                variant="outlined"
                fullWidth
                required
                autoFocus
                className={classes.fieldRow}
                onChange={fieldChangeHandler}
              />
              <TextField
                autoComplete="confirm-new-password"
                id="confirm-new-password"
                name="confirmNewPassword"
                label="confirm new password"
                type="password"
                value={fieldValues.confirmNewPassword}
                variant="outlined"
                fullWidth
                required
                className={classes.fieldRow}
                onChange={fieldChangeHandler}
              />
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                autoFocus
                fullWidth
                className={classes.fieldRow}
              >
                Change Password
              </Button>
            </form>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

const mapStateToProps = (state) => {
  return {
    isAuthenticated: state.authReducer.isAuthenticated,
    as: state.authReducer.as,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loginAdmin: (token, profile) => {
      dispatch(loginAdminAction(token, profile));
    },
    setModalState: (modalState, text, severity) =>
      dispatch(setModalStateAction({ showModal: modalState, text, severity })),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPasswordPage);
