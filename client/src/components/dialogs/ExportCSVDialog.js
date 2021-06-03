import React, { useEffect, useState } from "react";
import {
  makeStyles,
  Dialog,
  IconButton,
  Typography,
  Slide,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Input,
  Grid,
  Chip,
  useTheme,
  Button,
} from "@material-ui/core";
import { ExportToCsv } from "export-to-csv";
import CloseIcon from "@material-ui/icons/Close";
import {
  getUserRoles,
  getCsvData,
} from "../../utility/utilityFunctions/apiCalls";
import {
  setModalStateAction,
  setStaticModalAction,
} from "../../actions/modalActions";
import { connect } from "react-redux";

const useStyles = makeStyles((theme) => ({
  title: {
    fontFamily: "Merriweather sans",
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  subTitle: {
    color: "#666",
    fontSize: ".9rem",
    fontFamily: "Merriweather sans",
    fontWeight: "600",
    textTransform: "uppercase",
    margin: ".6rem 0",
  },
  selection: {
    minWidth: "20rem",
    maxWidth: "30rem",
    fontFamily: "Merriweather sans",
    backgroundColor: "#f4f5f7",
    margin: ".6rem 0 .4rem .4rem",
  },
  formContainer: {
    marginTop: "2rem",
    fontFamily: "Merriweather sans",
    maxWidth: "35%",
    minHeight: "100%",
    [theme.breakpoints.down("sm")]: {
      maxWidth: "100%",
      marginTop: "5rem",
      padding: "1rem",
    },
  },
  form: {
    display: "flex",
    flexDirection: "column",
    fontFamily: "Merriweather sans",
    flexWrap: "nowrap",
  },
  label: {
    color: "#949DA8",
    fontWeight: 600,
    marginTop: ".7rem",
    fontFamily: "Merriweather sans",
  },
  inputBox: {
    backgroundColor: "#ebeef5",
    border: "none",
    outline: "none",
    fontSize: "1.2rem",
    fontFamily: "Merriweather sans",
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
  radioLabel: {
    fontFamily: "Merriweather Sans",
    fontWeight: 400,
    fontFamily: "Merriweather sans",
  },
  fieldRow: {
    margin: ".3rem 0",
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
    fontFamily: "Merriweather sans",
  },
  btnStyles: {
    textTransform: "none",
    backgroundColor: "#3352CC",
    marginRight: ".4rem",
    fontFamily: "Merriweather sans",
    fontWeight: 600,
  },
}));

function getStyles(name, selectedRoles, theme) {
  return {
    fontWeight:
      selectedRoles.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="right" ref={ref} {...props} />;
});

const checkboxFields = ["projects_working_on", "permissions"];

const ExportCSVDialog = ({ open, handleClose, ...props }) => {
  const classes = useStyles();
  const theme = useTheme();
  const [exporting, setExporting] = useState(false);
  const [roles, setRoles] = useState([]);
  const [formValues, setFormValues] = useState({
    users: "all",
    selected_roles: [],
    projects_working_on: false,
    permissions: false,
  });
  const [selectedRoles, setSelectedRoles] = React.useState([]);

  const handleChange = (event) => {
    setSelectedRoles(event.target.value);
  };

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
    const { name, value, checked } = e.target;
    if (checkboxFields.includes(name)) {
      return setFormValues((prev) => ({ ...prev, [name]: checked }));
    }
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const submitHandler = (e) => {
    e.preventDefault();
    setExporting(true);
    props.setStaticModal(true, "Exporting CSV file...");
    const headers = ["id", "name", "email", "created", "lastActivity", "role"];
    if (formValues.permissions) headers.push("permissions");
    if (formValues.projects_working_on) headers.push("projects_working_on");

    const options = {
      fieldSeparator: ",",
      quoteStrings: '"',
      filename: "export-users",
      decimalSeparator: ".",
      showLabels: true,
      showTitle: true,
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: false,
      headers,
    };

    const csvExporter = new ExportToCsv(options);

    const args = {
      users: formValues.users,
      selected_roles: formValues.selected_roles,
    };
    args.selected_roles = args.selected_roles.map((role) => role._id);

    getCsvData(args)
      .then((resp) => {
        setExporting(false);
        props.setStaticModal(false, "");
        const fetchedData = resp.data;
        const data = fetchedData.map((user) => {
          let rolePermissions = "";
          const {
            _id: id,
            name,
            email,
            createdAt: created,
            lastActivity,
            userRole: { title: role },
          } = user;
          const userObj = { id, name, email, created, lastActivity, role };
          if (formValues.permissions) {
            rolePermissions = user.userRole.permissions
              .map((permission) => permission.replace("_", " ").toLowerCase())
              .join(", ");
            userObj["permissions"] = rolePermissions;
          }
          if (formValues.projects_working_on) {
            userObj["projects_working_on"] = user.projects.length;
          }
          return userObj;
        });
        csvExporter.generateCsv(data);
        handleClose();
      })
      .catch((error) => {
        setExporting(false);
        props.setStaticModal(false, "");
        props.setStaticModal(false, "");
        if (error.response?.data?.error)
          return props.setModalState(true, error.response.data.error, "error");
        props.setModalState(
          true,
          "Something went wrong. Try again later.",
          "error"
        );
      });
  };

  const handleDelete = (id) => {
    const updatedRoles = selectedRoles.filter((role) => role._id === id);
    setSelectedRoles(updatedRoles);
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
          <Grid
            container
            direction="column"
            alignItems="center"
            className={classes.formContainer}
          >
            <Grid
              container
              direction="column"
              style={{
                marginBottom: "1rem",
              }}
            >
              <Typography
                variant="h5"
                style={{
                  color: "#333",
                  fontFamily: "Merriweather Sans",
                  marginBottom: ".8rem",
                }}
              >
                Select users to export
              </Typography>
              <Typography
                style={{
                  fontFamily: "Merriweather Sans",
                  color: "#444",
                  marginBottom: ".8rem",
                }}
              >
                We will export selected users to a CSV file that you will
                download.
              </Typography>
            </Grid>
            <form className={classes.form} onSubmit={submitHandler}>
              <Grid container direction="column" className={classes.fieldRow}>
                <fieldset
                  onChange={changeHandler}
                  style={{
                    textDecoration: "none",
                    border: 0,
                    margin: 0,
                    padding: 0,
                  }}
                >
                  <legend className={classes.subTitle}>Users</legend>
                  <Grid
                    container
                    direction="column"
                    style={{
                      marginLeft: ".3rem",
                    }}
                  >
                    <Grid container>
                      <input
                        type="radio"
                        name="users"
                        value="all"
                        id="all"
                        checked={formValues.users === "all"}
                      />
                      <label htmlFor="all" className={classes.radioLabel}>
                        All users on the portal
                      </label>
                    </Grid>
                    <Grid container className={classes.fieldRow}>
                      <input
                        type="radio"
                        name="users"
                        value="selected"
                        id="selected"
                        checked={formValues.users === "selected"}
                      />

                      <label htmlFor="selected" className={classes.radioLabel}>
                        Users from selected roles only:
                      </label>
                      <Grid
                        container
                        style={{
                          marginLeft: ".4rem",
                        }}
                      >
                        <Select
                          labelId="select-roles"
                          id="select-roles"
                          multiple
                          className={classes.selection}
                          variant="outlined"
                          disabled={formValues.users !== "selected"}
                          value={formValues.selected_roles}
                          name="selected_roles"
                          onChange={changeHandler}
                          input={<Input id="select-multiple-chip" />}
                          renderValue={(selected) => (
                            <div className={classes.chips}>
                              {selected.map((role) => (
                                <Chip
                                  //   onClick={handleClick}
                                  name="chip"
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                  }}
                                  onDelete={() => handleDelete(role._id)}
                                  variant="outlined"
                                  key={role._id}
                                  label={role.title}
                                  className={classes.chip}
                                />
                              ))}
                            </div>
                          )}
                          MenuProps={MenuProps}
                        >
                          {roles.map((role) => (
                            <MenuItem
                              key={role._id}
                              value={role}
                              style={getStyles(
                                role.title,
                                formValues.selected_roles,
                                theme
                              )}
                            >
                              {role.title.replace("-", " ").toLowerCase()}
                            </MenuItem>
                          ))}
                        </Select>
                      </Grid>
                    </Grid>
                  </Grid>
                </fieldset>
              </Grid>
              <Grid
                container
                direction="column"
                style={{
                  marginBottom: "1rem",
                }}
              >
                <Typography className={classes.subTitle}>
                  Additional Data
                </Typography>
                <FormControlLabel
                  style={{
                    margin: 0,
                    padding: 0,
                    marginBottom: "-.5rem",
                  }}
                  control={
                    <Checkbox
                      checked={formValues.projects_working_on}
                      onChange={changeHandler}
                      name="projects_working_on"
                      color="primary"
                    />
                  }
                  label={
                    <Typography className={classes.radioLabel}>
                      Projects working on
                    </Typography>
                  }
                />
                <FormControlLabel
                  style={{
                    margin: 0,
                    padding: 0,
                    marginBottom: "-.5rem",
                  }}
                  control={
                    <Checkbox
                      checked={formValues.permissions}
                      onChange={changeHandler}
                      name="permissions"
                      color="primary"
                    />
                  }
                  label={
                    <Typography className={classes.radioLabel}>
                      Permissions
                    </Typography>
                  }
                />
              </Grid>
              <Grid container>
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
                >
                  Download file
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

const mapDispatchToProps = (dispatch) => {
  return {
    setModalState: (modalState, text, severity) =>
      dispatch(setModalStateAction({ showModal: modalState, text, severity })),

    setStaticModal: (modalState, text) =>
      dispatch(setStaticModalAction({ showStaticModal: modalState, text })),
  };
};

export default connect(null, mapDispatchToProps)(ExportCSVDialog);
