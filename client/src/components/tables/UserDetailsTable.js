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
} from "@material-ui/core";
import moment from "moment";
import { connect } from "react-redux";
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
  const [editRow, setEditRow] = useState("");
  const [editingRow, setEditingRow] = useState({});
  const [roles, setRoles] = useState([]);
  const [updating, setUpdating] = useState(false);
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
      orderBy: orderBy === "User" ? "username" : orderBy,
      limit: (page + 1) * rowsPerPage - users.length,
      skip: users.length,
    })
      .then((resp) => {
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
    const dataRows = [];
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
    setRows(dataRows);
  }, [users, searchText]);

  useEffect(() => {
    getUserRoles()
      .then((resp) => {
        setRoles(resp.data.roles);
      })
      .catch((error) => {
        console.log(error, error.response);
      });
  }, []);

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
        newSelecteds.push(n.username);
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

  const handleClick = (event, username, id) => {
    if (event.target.innerText === "Resend invite") return;
    const selectedIndex = selected.indexOf(username);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, username);
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

  const updateUsers = () => {
    setUsers([]);
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

  const startEditing = (row) => {
    console.log(row);
    setEditRow(row.id);
    setEditingRow(row);
  };

  const cancelEditing = () => {
    setEditRow("");
    setEditingRow({});
  };

  const updateUserHandler = (index) => {
    setUpdating(true);
    const user = users.find((user) => user._id === editRow);
    user.userRole = editingRow.userRole;
    updateUser({ uid: editingRow.id, roleId: editingRow.userRole._id })
      .then((resp) => {
        setUpdating(false);
        const updatedUsersList = [...users];
        updatedUsersList[index] = resp.data.user;
        setUsers(updatedUsersList);
        cancelEditing();
        props.setModalState(true, "user details updated!", "info");
      })
      .catch((error) => {
        setUpdating(false);
        if (error.response && error.response.data && error.response.data.error)
          return props.setModalState(true, error.response.data.error, "error");
        props.setModalState(true, "Something went wrong!", "error");
      });
  };

  const roleChangeHandler = (e) => {
    const role = roles.find((role) => role._id === e.target.value);
    setEditingRow((curr) => ({ ...curr, userRole: role }));
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
          editing={!!editRow}
          cancelEditing={() => cancelEditing()}
          users={users}
          updateUsers={updateUsers}
          searchChangeHandler={searchChangeHandler}
          setModalState={props.setModalState}
          setStaticModal={props.setStaticModal}
          deselectAll={deselectAll}
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
                        <Grid
                          container
                          direction="row"
                          style={{
                            flexWrap: "nowrap",
                          }}
                        >
                          <Skeleton variant="circle" width={40} height={40} />
                          <Skeleton
                            variant="rect"
                            width={150}
                            height={40}
                            style={{ marginLeft: ".2rem" }}
                          />
                        </Grid>
                      </TableCell>

                      <TableCell align="right">{row.userRole}</TableCell>
                      <TableCell align="right">{row.lastActivity}</TableCell>
                      <TableCell align="right">
                        <Skeleton />
                      </TableCell>
                      <TableCell align="right">
                        <Skeleton />
                      </TableCell>
                      <TableCell align="right">{row.createdAt}</TableCell>
                    </TableRow>
                  );
                })}
              </>
            ) : (
              <TableBody>
                {stableSort(
                  rows,
                  getComparator(
                    order,
                    orderBy === "User" ? "username" : orderBy
                  )
                )
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    const labelId = `enhanced-table-checkbox-${index}`;
                    if (editRow === row.id) {
                      return (
                        <TableRow
                          hover
                          onClick={(event) =>
                            handleClick(event, row.username, row.id)
                          }
                          role="checkbox"
                          tabIndex={-1}
                          key={row.id}
                          style={{
                            backgroundColor: "#eee",
                          }}
                        >
                          <TableCell padding="checkbox">
                            <Typography className={classes.iconStyles}>
                              {updating ? (
                                <CircularProgress size={16} />
                              ) : (
                                <Check
                                  onClick={() => updateUserHandler(index)}
                                />
                              )}
                            </Typography>
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
                                    style={{
                                      fontSize: "1.4rem",
                                      margin: ".3rem",
                                    }}
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
                            <FormControl className={classes.margin}>
                              <Select
                                labelId="select-role"
                                id="select-role"
                                value={editingRow.userRole._id}
                                onChange={roleChangeHandler}
                              >
                                {roles.map((role) => (
                                  <MenuItem value={role._id}>
                                    {role.title.toLowerCase().replace("_", " ")}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell align="center">
                            {row.projects + row.assigned}
                          </TableCell>
                          <TableCell align="center">
                            {row.lastActivity}
                          </TableCell>
                          <TableCell
                            className={classes.link}
                            onClick={() => resentInvite(row.email)}
                          >
                            Resend invite
                          </TableCell>
                          <TableCell align="center">{row.createdAt}</TableCell>
                        </TableRow>
                      );
                    }

                    return (
                      <TableRow
                        hover
                        onClick={(event) =>
                          handleClick(event, row.username, row.id)
                        }
                        role="checkbox"
                        tabIndex={-1}
                        key={row.id}
                      >
                        <TableCell padding="checkbox">
                          <Typography className={classes.iconStyles}>
                            <Edit3 onClick={() => startEditing(row)} />
                          </Typography>
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
                                  style={{
                                    fontSize: "1.4rem",
                                    margin: ".3rem",
                                  }}
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
                        <TableCell align="center">
                          {row.projects + row.assigned}
                        </TableCell>
                        <TableCell align="center">{row.lastActivity}</TableCell>
                        <TableCell
                          className={classes.link}
                          onClick={() => resentInvite(row.email)}
                        >
                          Resend invite
                        </TableCell>
                        <TableCell align="center">{row.createdAt}</TableCell>
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
