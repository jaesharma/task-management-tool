import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { lighten, makeStyles } from "@material-ui/core/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  Paper,
  InputBase,
  Grid,
  Avatar,
  Button,
  CircularProgress,
  Tooltip,
} from "@material-ui/core";
import moment from "moment";
import { connect, useDispatch } from "react-redux";
import {
  setModalStateAction,
  setStaticModalAction,
} from "../../actions/modalActions";
import { Check, Edit3 } from "react-feather";
import { useConfirm } from "material-ui-confirm";
import { NavLink } from "react-router-dom";
import {
  getUsers,
  resendInvite,
  getUserRoles,
  updateUser,
} from "../../utility/utilityFunctions/apiCalls";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Skeleton from "@material-ui/lab/Skeleton";

function createData(
  id,
  username,
  name,
  avatar,
  email,
  projects,
  teams,
  userRole,
  lastActivity,
  createdAt,
  updatedAt
) {
  return {
    id,
    username,
    name,
    avatar,
    email,
    projects,
    teams,
    userRole,
    lastActivity,
    createdAt,
    updatedAt,
  };
}

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: "User",
    numeric: false,
    disablePadding: false,
    label: "User",
  },
  {
    id: "role",
    numeric: false,
    disablePadding: false,
    label: "Role",
  },
  {
    id: "projects-working-on",
    numeric: true,
    disablePadding: false,
    label: "Projects working on",
  },
  {
    id: "last-activity",
    numeric: true,
    disablePadding: false,
    label: "Last activity",
  },
  { id: "action", numeric: false, disablePadding: false, label: "Action" },
  {
    id: "joined",
    numeric: true,
    disablePadding: false,
    label: "Joined",
  },
];

function EnhancedTableHead(props) {
  const {
    classes,
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  const allowSortOn = [
    "user",
    "role",
    "projects-working-on",
    "joined",
    "last-activity",
  ];

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox"></TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "default"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {allowSortOn.includes(headCell.id.toLowerCase()) ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id)}
                style={{
                  fontWeight: 600,
                }}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <span className={classes.visuallyHidden}>
                    {order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </span>
                ) : null}
              </TableSortLabel>
            ) : (
              <Typography
                style={{
                  fontWeight: 600,
                  fontSize: ".96rem",
                }}
              >
                {headCell.label}
              </Typography>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    marginTop: "1rem",
  },
  highlight:
    theme.palette.type === "light"
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  title: {
    flex: "1 1 100%",
    textAlign: "center",
  },
  searchBar: {
    padding: "0 4px",
    borderRadius: "4px",
    background: "#F3F3F3",
    transition: "all ease-in-out .2s",
    [theme.breakpoints.up("md")]: {
      minWidth: "14rem",
    },
  },
  searchbarFocused: {
    border: "1px solid #999",
  },
}));

const EnhancedTableToolbar = (props) => {
  const classes = useToolbarStyles();

  return (
    <Toolbar
      className={classes.root}
      style={{
        borderBottom: "1px solid #ccc",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <InputBase
        placeholder="Search"
        className={classes.searchBar}
        classes={{
          focused: classes.searchbarFocused,
        }}
        onChange={props.searchChangeHandler}
      />
      <Grid item xs={3} container justify="flex-end">
        {props.editing && (
          <Button onClick={() => props.cancelEditing()}>Cancel editing</Button>
        )}
      </Grid>
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
  },
  titleLink: {
    color: "black",
    textDecoration: "none",
    "&:hover": {
      color: "blue",
    },
  },
  iconCell: {
    "&:hover": {
      cursor: "pointer",
    },
  },
  link: {
    color: "black",
    textDecoration: "none",
    "&:hover": {
      color: "blue",
      cursor: "pointer",
    },
  },
  iconStyles: {
    marginLeft: ".8rem",
    "&:hover": {
      cursor: "pointer",
    },
  },
}));

const ProjectListTable = () => {
  return <div>abv</div>;
};

export default ProjectListTable;
