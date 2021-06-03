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
import { useDispatch } from "react-redux";
import {
  setModalStateAction,
  setStaticModalAction,
} from "../../actions/modalActions";
import { Star } from "react-feather";
import { useConfirm } from "material-ui-confirm";
import { NavLink } from "react-router-dom";
import {
  getProjects,
  starProject,
} from "../../utility/utilityFunctions/apiCalls";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Skeleton from "@material-ui/lab/Skeleton";

function createData(
  id,
  title,
  icon,
  key,
  starred,
  members,
  leadId,
  leadName,
  leadAvatar
) {
  return {
    id,
    title,
    icon,
    key,
    starred,
    members,
    leadId,
    leadName,
    leadAvatar,
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
    id: "title",
    numeric: false,
    disablePadding: false,
    label: "Title",
  },
  {
    id: "key",
    numeric: false,
    disablePadding: false,
    label: "Key",
  },
  {
    id: "members",
    numeric: true,
    disablePadding: false,
    label: "Members",
  },
  {
    id: "lead",
    numeric: false,
    disablePadding: false,
    label: "Lead",
  },
];

function EnhancedTableHead(props) {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  const allowSortOn = ["title", "key", "members"];

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Grid container justify="center">
            <Star
              size={14}
              style={{
                fill: "#5E6C85",
                stroke: "#5E6C85",
                paddingRight: ".4rem",
              }}
            />
          </Grid>
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={["title", "lead"].includes(headCell.id) ? "left" : "center"}
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
    fontFamily: "Merriweather Sans",
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
    fontFamily: "Merriweather Sans",
    position: "absolute",
    top: 20,
    width: 1,
  },
  titleLink: {
    color: "blue",
    fontFamily: "Merriweather Sans",
    textDecoration: "none",
  },
  iconCell: {
    "&:hover": {
      cursor: "pointer",
    },
  },
  starred: {
    fill: "#F5AB00",
    stroke: "#F5AB00",
  },
  star: {
    stroke: "#bbb",
  },
  link: {
    textDecoration: "none",
    color: "blue",
    fontFamily: "Merriweather Sans",
    "&:hover": {
      cursor: "pointer",
    },
  },
  iconStyles: {
    marginLeft: ".8rem",
    "&:hover": {
      cursor: "pointer",
    },
  },
  avatarStyles: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
}));

const ProjectListTable = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(1);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("username");
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rows, setRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const confirmation = useConfirm();

  useEffect(() => {
    getProjects()
      .then((resp) => {
        setProjects(resp.data.projects);
      })
      .catch((error) => {
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
            text: "Something went wrong!",
            severity: "error",
          })
        );
      });
  }, []);

  useEffect(() => {
    const dataRows = [];
    projects.forEach((project) => {
      let { _id, title, icon } = project.project;
      const {
        _id: leadId,
        name: leadName,
        avatar: leadAvatar,
      } = project.project.lead;
      dataRows.push(
        createData(
          _id,
          title,
          icon,
          project.key,
          project.starred,
          project.project.members.length,
          leadId,
          leadName,
          leadAvatar
        )
      );
    });
    setRows(dataRows);
  }, [projects]);

  const handleRequestSort = (_event, property) => {
    if (projects.length < total) setProjects([]);
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const searchChangeHandler = (e) => {
    setSearchText(e.target.value);
  };

  const starClickHandler = (projectId, index) => {
    starProject(projectId)
      .then((resp) => {
        console.log(resp)
        const updatedProjects = [...projects];
        updatedProjects[index] = resp.data.project;
        setProjects(updatedProjects);
      })
      .catch((error) => {
        console.log(error)
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
            text: "Something went wrong. Try again later",
            severity: "error",
          })
        );
      });
  };

  const renderSkeleton = () => {
    const skeletonRows = [];
    for (let i = 0; i < rowsPerPage; i++) {
      // skeletonRows.push(<Skeleton />);
      skeletonRows.push(
        createData(
          <Skeleton />,
          <Skeleton />,
          <Skeleton />,
          <Skeleton height={40} />,
          <Skeleton height={40} />,
          <Skeleton height={40} />,
          <Skeleton height={40} />,
          <Skeleton height={40} />,
          <Skeleton height={40} />,
          <Skeleton height={40} />,
          <Skeleton height={40} />,
          <Skeleton />
        )
      );
    }
    return skeletonRows;
  };

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar
          projects={projects}
          searchChangeHandler={searchChangeHandler}
        />
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={dense ? "small" : "medium"}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {stableSort(
                rows,
                getComparator(order, orderBy === "User" ? "username" : orderBy)
              )
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const labelId = `enhanced-table-checkbox-${index}`;
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                      <TableCell
                        padding="checkbox"
                        onClick={() => starClickHandler(row.id, index)}
                      >
                        <Typography className={classes.iconStyles}>
                          <Star
                            size={18}
                            className={
                              row.starred ? classes.starred : classes.star
                            }
                          />
                        </Typography>
                      </TableCell>
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                        style={{
                          paddingLeft: "1rem",
                          maxWidth: "4rem",
                        }}
                      >
                        <NavLink
                          to={`/projects/${row.id}`}
                          className={classes.titleLink}
                        >
                          <Grid
                            container
                            direction="row"
                            alignItems="center"
                            style={{
                              flexWrap: "nowrap",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            <Avatar
                              className={classes.avatarStyles}
                              src={row.icon}
                              variant="rounded"
                            />
                            <Typography
                              style={{
                                paddingLeft: ".7rem",
                                fontFamily: "Merriweather Sans",
                              }}
                            >
                              {row.title}
                            </Typography>
                          </Grid>
                        </NavLink>
                      </TableCell>
                      <TableCell
                        align="center"
                        size="small"
                        style={{
                          maxWidth: "50px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontFamily: "Merriweather Sans",
                        }}
                      >
                        {row.key}
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{
                          maxWidth: "1rem",
                        }}
                      >
                        {row.members}
                      </TableCell>
                      <TableCell>
                        <NavLink
                          to={`/users/${row.leadId}`}
                          className={classes.titleLink}
                        >
                          <Grid
                            container
                            direction="row"
                            style={{
                              flexWrap: "nowrap",
                            }}
                          >
                            <Grid item xs={1}>
                              <Avatar
                                className={classes.avatarStyles}
                                src={row.leadAvatar}
                              />
                            </Grid>
                            <Grid item xs={11}>
                              <Typography
                                style={{
                                  fontFamily: "Merriweather Sans",
                                  paddingLeft: ".4rem",
                                }}
                              >
                                {row.leadName}
                              </Typography>
                            </Grid>
                          </Grid>
                        </NavLink>
                      </TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
};

export default ProjectListTable;
