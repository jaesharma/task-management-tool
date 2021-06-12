import React, { useState } from "react";
import { Grid, makeStyles, Typography, Avatar } from "@material-ui/core";
import { useSelector } from "react-redux";
import { Mail, Briefcase, MapPin } from "react-feather";
import { updateProfile } from "../../utility/utilityFunctions/apiCalls";
import { setModalStateAction } from "../../actions/modalActions";
import { useDispatch } from "react-redux";
import { SETUP_INITIAL_PROFILE } from "../../actions/actionTypes";

const useStyles = makeStyles((theme) => ({
  container: {
    width: "100%",
  },
  header: {
    background: "rgb(2,0,36)",
    background:
      "linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(9,40,121,1) 35%, rgba(0,212,255,1) 100%)",
    minHeight: "13rem",
    maxHeight: "13rem",
    width: "100%",
  },
  profileImg: {
    position: "absolute",
  },
  avatar: {
    width: theme.spacing(15),
    height: theme.spacing(15),
    boxShadow: "0px 0px 0px 2px #fff",
    top: 140,
    left: 50,
    transition: "all ease-in-out .2s",
    [theme.breakpoints.down("sm")]: {
      width: theme.spacing(12),
      height: theme.spacing(12),
      top: 160,
      left: 30,
    },
  },
  body: {
    paddingTop: "4rem",
  },
  bodyLeftBlock: {
    height: "100%",
  },
  bodyRightBlock: {
    minHeight: "100%",
    paddingLeft: "2rem",
    borderLeft: "1px solid #aaa",
  },
  boldText: {
    paddingLeft: "4rem",
    fontFamily: "Merriweather Sans",
    fontWeight: 600,
    color: "#172b4d",
    fontSize: "1.2rem",
  },
  blockHeading: {
    fontSize: ".8rem",
    fontFamily: "Merriweather Sans",
    fontWeight: 600,
    color: "#333",
    textTransform: "uppercase",
    marginTop: "2rem",
  },
  aboutSection: {
    width: "80%",
    alignSelf: "center",
    borderRadius: "8px",
    margin: "2rem 0",
    padding: "1rem",
    paddingTop: 0,
    boxShadow: "1px 1px 8px -2px #aaa",
  },
  icon: {
    marginRight: ".4rem",
  },
  placeholder: {
    color: "#666",
    fontSize: ".9rem",
    alignSelf: "center",
    width: "100%",
    padding: "4px",
    "&:hover": {
      background: "#f1f6f4",
    },
  },
  boldInput: {
    fontFamily: "Merriweather Sans",
    fontWeight: 600,
    color: "#172b4d",
    fontSize: "1.2rem",
    width: "70%",
  },
  row: {
    paddingLeft: "1rem",
    margin: ".2rem 0",
    width: "100%",
    "&:hover": {
      background: "#f1f5f7",
    },
  },
  title: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#444",
  },
}));

const InfoRow = (props) => {
  return (
    <Grid
      container
      justify="flex-start"
      style={{
        flexWrap: "nowrap",
        margin: ".4rem 0",
      }}
    >
      {props.children}
    </Grid>
  );
};

const UserProfile = () => {
  const classes = useStyles();
  const user = useSelector((state) => state.authReducer.user);
  const [editing, setEditing] = useState("");
  const [text, setText] = useState("");
  const dispatch = useDispatch();

  const startEditing = (target, value = null) => {
    if (value) setText(value);
    setEditing(target);
  };

  const cancelEditing = () => {
    setEditing("");
    setText("");
  };

  const changeHandler = (e) => {
    setText(e.target.value);
  };

  const updateField = () => {
    const updates = {
      [editing]: text,
    };
    updateProfile(updates)
      .then((resp) => {
        const { profile } = resp.data;
        dispatch({
          type: SETUP_INITIAL_PROFILE,
          payload: {
            as: "user",
            profile,
          },
        });
        cancelEditing();
      })
      .catch((error) => {
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

  const detectKey = (e) => {
    if (e.key === "Escape") return cancelEditing();
    if (e.key === "Enter") return updateField();
  };

  return (
    <Grid container direction="column">
      <Grid container className={classes.header}></Grid>
      <Grid container className={classes.profileImg} >
        {user.avatar ? (
          <Avatar
            src={user.avatar}
            alt="profile-image"
            className={classes.avatar}
          />
        ) : (
          <Avatar className={classes.avatar} />
        )}
      </Grid>
      <Grid container className={classes.body}>
        <Grid
          item
          xs={4}
          container
          direction="column"
          className={classes.bodyLeftBlock}
        >
          {editing === "name" ? (
            <input
              value={text}
              onChange={changeHandler}
              onKeyUp={detectKey}
              onBlur={() => cancelEditing()}
              autoFocus
              className={classes.boldInput}
            />
          ) : (
            <Typography
              className={classes.boldText}
              onDoubleClick={() => startEditing("name")}
            >
              {user.name}
            </Typography>
          )}

          <Typography
            className={classes.boldText}
            style={{
              fontSize: ".8rem",
              color: "#444",
            }}
          >
            @{user.username}
          </Typography>
          <Grid
            container
            direction="column"
            direction="column"
            className={classes.aboutSection}
            data-aos="fade-up"
          >
            <Typography className={classes.blockHeading}>About</Typography>
            <InfoRow>
              <Briefcase className={classes.icon} />
              {editing !== "jobTitle" && user.about?.jobTitle ? (
                <Typography
                  onDoubleClick={() =>
                    startEditing("jobTitle", user.about.jobTitle)
                  }
                >
                  {user.about.jobTitle}
                </Typography>
              ) : editing === "jobTitle" ? (
                <input
                  value={text}
                  onChange={changeHandler}
                  onKeyUp={detectKey}
                  onBlur={() => cancelEditing()}
                  autoFocus
                  className={classes.input}
                />
              ) : (
                <Typography
                  className={classes.placeholder}
                  onDoubleClick={() => startEditing("jobTitle")}
                >
                  Your job title
                </Typography>
              )}
            </InfoRow>
            <InfoRow>
              <img
                src="/assets/department.svg"
                className={classes.icon}
                style={{
                  width: "1.5rem",
                  height: "1.4rem",
                }}
              />
              {editing !== "department" && user.about?.department ? (
                <Typography
                  onDoubleClick={() =>
                    startEditing("department", user.about.department)
                  }
                >
                  {user.about.department}
                </Typography>
              ) : editing === "department" ? (
                <input
                  value={text}
                  onChange={changeHandler}
                  onBlur={() => cancelEditing()}
                  onKeyUp={detectKey}
                  autoFocus
                  className={classes.input}
                />
              ) : (
                <Typography
                  className={classes.placeholder}
                  onDoubleClick={() => startEditing("department")}
                >
                  Your department
                </Typography>
              )}
            </InfoRow>
            <InfoRow>
              <img
                src="/assets/organization.svg"
                className={classes.icon}
                style={{
                  width: "1.5rem",
                  height: "1.4rem",
                }}
              />
              {editing !== "organization" && user.about?.orgranization ? (
                <Typography
                  onDoubleClick={() =>
                    startEditing("organization", user.about.orgranization)
                  }
                >
                  {user.about.orgranization}
                </Typography>
              ) : editing === "organization" ? (
                <input
                  value={text}
                  onChange={changeHandler}
                  onBlur={() => cancelEditing()}
                  onKeyUp={detectKey}
                  autoFocus
                  className={classes.input}
                />
              ) : (
                <Typography
                  className={classes.placeholder}
                  onDoubleClick={() => startEditing("organization")}
                >
                  Your organisation
                </Typography>
              )}
            </InfoRow>
            <InfoRow>
              <MapPin className={classes.icon} />
              {editing !== "location" && user.about?.location ? (
                <Typography
                  onDoubleClick={() =>
                    startEditing("location", user.about.location)
                  }
                >
                  {user.about.location}
                </Typography>
              ) : editing === "location" ? (
                <input
                  value={text}
                  onChange={changeHandler}
                  onBlur={() => cancelEditing()}
                  onKeyUp={detectKey}
                  autoFocus
                  className={classes.input}
                />
              ) : (
                <Typography
                  className={classes.placeholder}
                  onDoubleClick={() => startEditing("location")}
                >
                  Your location
                </Typography>
              )}
            </InfoRow>

            <Typography className={classes.blockHeading}>Contact</Typography>
            <InfoRow>
              <Mail className={classes.icon} />
              <Typography>{user.email}</Typography>
            </InfoRow>
          </Grid>
        </Grid>
        <Grid
          item
          xs={8}
          container
          direction="column"
          className={classes.bodyRightBlock}
        >
          <Typography
            className={classes.boldText}
            style={{
              fontSize: "1rem",
            }}
          >
            Worked on
          </Typography>
          <Grid
            container
            direction="column"
            style={{
              paddingTop: "1rem",
            }}
          >
            {user.projects.map((project) => {
              return (
                <Grid container className={classes.row}>
                  <Typography className={classes.title}>
                    {project.project.title}
                  </Typography>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default UserProfile;
