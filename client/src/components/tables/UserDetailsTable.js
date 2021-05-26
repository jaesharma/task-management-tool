import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
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
  Checkbox,
  IconButton,
  Tooltip,
  InputBase,
  Grid,
  Avatar,
} from "@material-ui/core";
import moment from "moment";
import DeleteIcon from "@material-ui/icons/Delete";
import { connect } from "react-redux";
import {
  setModalStateAction,
  setStaticModalAction,
} from "../../actions/modalActions";
import { useConfirm } from "material-ui-confirm";
import { NavLink } from "react-router-dom";
import Spinner from "../spinners/Spinner";
import {
  getUsers,
  resendInvite,
} from "../../utility/utilityFunctions/apiCalls";
import Skeleton from "@material-ui/lab/Skeleton";

function createData(
  id,
  username,
  name,
  avatar,
  email,
  projects,
  assigned,
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
    assigned,
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
    id: "last-activity",
    numeric: true,
    disablePadding: false,
    label: "Last activity",
  },
  { id: "Action", numeric: false, disablePadding: false, label: "Action" },
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

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ "aria-label": "select all desserts" }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "default"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
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
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </span>
              ) : null}
            </TableSortLabel>
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
  const { numSelected } = props;
  const confirmation = useConfirm();

  const deleteSelected = () => {
    const descriptionString = `${props.selectedIds.length} ${
      props.selectedIds.length > 1 ? "Users" : "User"
    } will be deleted?`;

    confirmation({
      description: descriptionString,
      confirmationText: "Delete",
      confirmationButtonProps: { color: "secondary" },
    })
      .then(() => {
        //delete user
      })
      .catch(() => {});
  };

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      <InputBase
        placeholder="Search"
        className={classes.searchBar}
        classes={{
          focused: classes.searchbarFocused,
        }}
        onChange={props.searchChangeHandler}
      />
      {numSelected > 0 && (
        <Typography
          className={classes.title}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      )}

      {numSelected > 0 && (
        <Tooltip title="Delete">
          <IconButton
            aria-label="delete"
            onClick={deleteSelected}
            disabled={!props.haveAccess}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      )}
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
}));

const UserDetailsTable = ({ ...props }) => {
  const classes = useStyles();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(1);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("username");
  const [selected, setSelected] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rows, setRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const confirmation = useConfirm();
  // const [projectsToRender, setProjectsToRender] = useState([]);

  const resentInvite = (email) => {
    confirmation({
      description:
        "New credentials will be generated and sent to user via email. Old credentials will not be valid anymore.",
      title:
        "This cannot be undone later. Please read carefully before confirming this.",
      confirmationButtonProps: { color: "primary" },
      confirmationText: "Continue",
    })
      .then(() => {
        props.setStaticModal(true, "Generating new credentails...");
        resendInvite(email)
          .then(() => {
            props.setStaticModal(false, "");
            props.setModalState(
              true,
              "New credentails sent to user.",
              "success"
            );
          })
          .catch((error) => {
            props.setStaticModal(false, "");
            if (
              error.response &&
              error.response.data &&
              error.response.data.error
            )
              props.setModalState(true, error.response.data.error, "error");
            else props.setModalState(true, "Something went wrong!", "error");
          });
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (users.length >= (page + 1) * rowsPerPage || users.length >= total)
      return;
    //fetch users
    getUsers({
      order,
      orderBy,
      limit: (page + 1) * rowsPerPage - users.length,
      skip: users.length,
    })
      .then((resp) => {
        console.log("resp: ", resp);
        const updatedUsers = [...users, ...resp.data.users];
        setTotal(resp.data.total);
        setUsers(updatedUsers);
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.error)
          props.setModalState(true, error.response.data.error, "error");
        else props.setModalState(true, "Something went wrong!", "error");
      });
  }, [page, orderBy, order, rowsPerPage]);

  useEffect(() => {
    // setProjectsToRender(projects);
    // if (searchText.trim().length) {
    //   const projectList = projects.filter((project) =>
    //     project.title.startsWith(searchText)
    //   );
    //   setProjectsToRender(projectList);
    // }else{
    //   setProjectsToRender(projects)
    // }

    const dataRows = [];
    console.log(users);
    users.forEach((user) => {
      let {
        _id,
        username,
        name,
        avatar,
        cover,
        email,
        about,
        projects,
        assigned,
        teams,
        userRole,
        lastActivity,
        createdAt,
        updatedAt,
      } = user;
      dataRows.push(
        createData(
          _id,
          username,
          name,
          avatar,
          email,
          projects.length,
          assigned.length,
          teams.length,
          userRole,
          lastActivity !== "-"
            ? new moment(lastActivity).format("YYYY, MMM DD")
            : "-",
          new moment(createdAt).format("YYYY, MMM DD"),
          new moment(updatedAt).format("YYYY, MMM DD")
        )
      );
    });
    console.log("datarow:", dataRows);
    setRows(dataRows);
  }, [users, searchText]);

  const handleRequestSort = (_event, property) => {
    if (users.length < total) setUsers([]);
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      let newSelecteds = [],
        allIds = [];
      rows.forEach((n) => {
        newSelecteds.push(n.title);
        allIds.push(n.id);
      });
      setSelected(newSelecteds);
      setSelectedIds(allIds);
      return;
    }
    setSelected([]);
    setSelectedIds([]);
  };

  const deselectAll = () => {
    setSelected([]);
    setSelectedIds([]);
  };

  const handleClick = (event, name, id) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelectedIds((prevState) => {
      if (prevState.includes(id)) {
        return prevState.filter((theid) => theid !== id);
      } else {
        return Array.from(new Set([...prevState].concat(id)));
      }
    });

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  const searchChangeHandler = (e) => {
    setSearchText(e.target.value);
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
          <Skeleton />,
          <Skeleton />,
          <Skeleton />,
          <Skeleton />,
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
          numSelected={selected.length}
          selected={selected}
          selectedIds={selectedIds}
          users={users}
          updateUsers={props.updateUserse}
          searchChangeHandler={searchChangeHandler}
          setModalState={props.setModalState}
          deselectAll={deselectAll}
          haveAccess={props.haveAccess}
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
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />

            {users.length !== total &&
            users.length < (page + 1) * rowsPerPage ? (
              <>
                {renderSkeleton().map((row) => {
                  return (
                    <TableRow>
                      <TableCell padding="checkbox"></TableCell>
                      <TableCell component="th" scope="row" padding="none">
                        <NavLink
                          to={`/users/${row.id}`}
                          className={classes.titleLink}
                        >
                          {row.title}
                        </NavLink>
                      </TableCell>
                      <TableCell align="right">{row.upvotes}</TableCell>
                      <TableCell align="right">{row.downvotes}</TableCell>
                      <TableCell align="right">{row.rewards}</TableCell>
                      <TableCell align="right">{row.comments}</TableCell>
                      <TableCell align="right">{row.uploadedOn}</TableCell>
                      <TableCell align="right">{row.lastUpdated}</TableCell>
                    </TableRow>
                  );
                })}
              </>
            ) : (
              <TableBody>
                {stableSort(rows, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    const isItemSelected = isSelected(row.title);
                    const labelId = `enhanced-table-checkbox-${index}`;

                    return (
                      <TableRow
                        hover
                        onClick={(event) =>
                          handleClick(event, row.title, row.id)
                        }
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row.title}
                        selected={isItemSelected}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isItemSelected}
                            inputProps={{ "aria-labelledby": labelId }}
                          />
                        </TableCell>
                        <TableCell
                          component="th"
                          id={labelId}
                          scope="row"
                          padding="none"
                        >
                          <NavLink
                            to={`/users/${row.id}`}
                            className={classes.titleLink}
                          >
                            <Grid
                              container
                              direction="row"
                              style={{
                                flexWrap: "nowrap",
                                padding: ".8rem",
                              }}
                            >
                              {row.avatar ? (
                                <Avatar
                                  className={classes.avatarStyles}
                                  src={row.avatar}
                                />
                              ) : (
                                <Avatar
                                  style={{
                                    fontSize: "1.4rem",
                                    margin: ".3rem",
                                  }}
                                >
                                  {row.name.charAt(0)}
                                </Avatar>
                              )}
                              <Grid
                                container
                                direction="column"
                                style={{
                                  marginLeft: ".5rem",
                                }}
                              >
                                <Typography>{row.name}</Typography>
                                <Typography
                                  style={{
                                    color: "#777",
                                    fontSize: ".8rem",
                                  }}
                                >
                                  {row.email}
                                </Typography>
                              </Grid>
                            </Grid>
                          </NavLink>
                        </TableCell>
                        <TableCell size="small">
                          {row.userRole.title.toUpperCase()}
                        </TableCell>
                        <TableCell align="right">{row.lastActivity}</TableCell>
                        <TableCell
                          className={classes.link}
                          onClick={() => resentInvite(row.email)}
                        >
                          Resend invite
                        </TableCell>
                        <TableCell align="right">{row.createdAt}</TableCell>
                      </TableRow>
                    );
                  })}
                {emptyRows > 0 && (
                  <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
            )}
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

const mapDispatchToProps = (dispatch) => {
  return {
    setModalState: (modalState, text, severity) =>
      dispatch(setModalStateAction({ showModal: modalState, text, severity })),
    setStaticModal: (modalState, text) =>
      dispatch(setStaticModalAction({ showStaticModal: modalState, text })),
  };
};

export default connect(null, mapDispatchToProps)(UserDetailsTable);
