import {
  CircularProgress,
  Grid,
  Typography,
  makeStyles,
  Popper,
  Fade,
  Paper,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Plus, MoreVertical } from "react-feather";
import { DragDropContext } from "react-beautiful-dnd";
import { NavLink } from "react-router-dom";
import Column from "./Column";
import { shiftTasks } from "../../utility/utilityFunctions/apiCalls";
import SetLimitDialog from "../dialogs/SetLimitDialog";
import DeleteColumnDialog from "../dialogs/DeleteColumnDialog";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: "3rem 1rem 0 4rem",
    flexWrap: "nowrap",
    height: "100%",
    [theme.breakpoints.down("sm")]: {
      padding: "3rem 1rem 1rem 1rem",
    },
  },
  textLabelSecondary: {
    color: "#6B778C",
    fontWeight: 400,
    fontFamily: "Merriweather Sans",
    "&:hover": {
      color: "#9b99ac",
      textDecoration: "underline",
    },
  },
  link: {
    textDecoration: "none",
  },
  boardText: {
    padding: ".3rem",
    transition: "all ease-in-out .2s",
    fontWeight: 600,
    marginTop: ".6rem",
    "&:hover": {
      background: "#eee",
    },
  },
  plusBtn: {
    background: "#f4f5f7",
    maxWidth: "2rem",
    maxHeight: "1.8rem",
    padding: ".4rem",
    borderRadius: "2px",
    marginTop: "5px",
    marginLeft: "6px",
    position: "sticky",
    top: 0,
    transition: "all ease-in-out .2s",
    "&:hover": {
      background: "#eee",
      cursor: "pointer",
    },
  },
  board: {
    flexWrap: "nowrap",
    width: "100%",
    marginTop: "2rem",
    // minHeight: "26.8rem",
    // maxHeight: "26.8rem",
    overflow: "auto",
    paddingTop: 0,
  },
  colHeader: {
    width: "100%",
    position: "sticky",
    top: -1,
    background: "#F4F5F7",
    borderRadius: "5px 5px 0 0",
    padding: ".6rem",
    margin: "0 .4rem",
    width: "16rem",
    paddingLeft: ".8rem",
    boxShadow: "0 4px 12px -9px #777",
    transition: "all ease-in-out .2s",
  },
  headerText: {
    textTransform: "uppercase",
    fontSize: ".8rem",
    fontWeight: 600,
    fontFamily: "Merriweather Sans",
    color: "#777",
    transition: "all ease-in-out .2s",
  },
  moreIcon: {
    "&:hover": {
      cursor: "pointer",
    },
  },
  popper: {
    padding: ".3rem",
  },
  optionBtn: {
    padding: ".4rem",
    "&:hover": {
      cursor: "pointer",
      backgroundColor: "#f1f5f7",
    },
  },
}));

const BoardsPage = ({ project, loading, ...props }) => {
  const classes = useStyles();
  const [addingNewColumn, setAddingNewColumn] = useState(false);
  const [showSetLimitDialog, setShowSetLimitDialog] = useState(false);
  const [showDeleteColumnDialog, setShowDeleteColumnDialog] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeCol, setActiveCol] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const addNewColumn = () => {
    setAddingNewColumn(true);
  };

  const handleOnDragEnd = (result) => {
    const { source, destination } = result;
    console.log(result);
    if (!destination) return;

    let { index: sOrder, droppableId: sourceId } = source;
    let { index: dOrder, droppableId: destId } = destination;
    if (!sOrder) sOrder = 1;
    if (!dOrder) dOrder = 1;
    const [scId, sColIndex] = sourceId.split("-");
    const [dcId, dColIndex] = destId.split("-");
    let sColumn = project.columns[sColIndex];
    let dColumn = project.columns[dColIndex];
    const taskToBeAdded = {
      ...sColumn.tasks[sOrder - 1],
      order: dOrder,
    };
    sColumn.tasks.splice(sOrder - 1, 1);
    sColumn.tasks = sColumn.tasks.map((task) => {
      return task.order > sOrder ? { ...task, order: task.order - 1 } : task;
    });
    dColumn.tasks = dColumn.tasks.map((task) => {
      return task.order >= dOrder ? { ...task, order: task.order + 1 } : task;
    });
    dColumn.tasks.splice(dOrder - 1, null, taskToBeAdded);
    props.setProject((project) => {
      const cols = [...project.columns];
      cols[sColIndex] = sColumn;
      cols[dColIndex] = dColumn;
      return { ...project, columns: cols };
    });

    shiftTasks({ scId, sOrder, dcId, dOrder })
      .then((resp) => {
        const { sourceColumn, destinationColumn } = resp.data;
        console.log(resp.data, sOrder, dOrder);
        props.setProject((project) => {
          const cols = [...project.columns];
          cols[sColIndex] = sourceColumn;
          cols[dColIndex] = destinationColumn;
          return { ...project, columns: cols };
        });
      })
      .catch((error) => {
        console.log(error, error.response);
      });
  };

  const closePopper = () => {
    setAnchorEl(null);
    setActiveCol(null);
    setOpen(false);
  };

  console.log(project);

  return (
    <Grid container direction="column" className={classes.container}>
      <Grid
        container
        direction="column"
        style={{
          background: "#fff",
        }}
      >
        {showSetLimitDialog && (
          <SetLimitDialog
            show={showSetLimitDialog}
            setShowSetLimitDialog={setShowSetLimitDialog}
            column={activeCol}
            closePopper={closePopper}
            updateColumn={props.updateColumn}
          />
        )}
        {showDeleteColumnDialog && (
          <DeleteColumnDialog
            show={showDeleteColumnDialog}
            column={activeCol}
            columns={project.columns.map((column) => ({
              _id: column._id,
              title: column.title,
            }))}
            fetchAndSetProject={props.fetchAndSetProject}
            closePopper={closePopper}
            setShowDeleteColumnDialog={setShowDeleteColumnDialog}
          />
        )}
        <Popper
          open={open}
          anchorEl={anchorEl}
          placement="bottom-end"
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <Paper elevation={4}>
                <Grid
                  container
                  direction="column"
                  alignItems="flex-end"
                  className={classes.popper}
                >
                  <Grid container className={classes.optionBtn}>
                    <Typography
                      style={{
                        fontFamily: "Merriweather Sans",
                        fontSize: ".8rem",
                        fontWeight: 600,
                      }}
                      onClick={() => setShowSetLimitDialog(true)}
                    >
                      Set Limit
                    </Typography>
                  </Grid>
                  <Grid container className={classes.optionBtn}>
                    <Typography
                      style={{
                        fontFamily: "Merriweather Sans",
                        fontSize: ".8rem",
                        fontWeight: 600,
                      }}
                      onClick={() => setShowDeleteColumnDialog(true)}
                    >
                      Delete
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Fade>
          )}
        </Popper>

        <Grid container>
          <NavLink to={`/user/projects`} className={classes.link}>
            <Typography className={classes.textLabelSecondary}>
              Projects
            </Typography>
          </NavLink>
          <Typography
            style={{
              color: "#6B778C",
              fontFamily: "Merriweather Sans",
              margin: "0 .2rem",
            }}
          >
            /
          </Typography>
          <NavLink
            to={`/projects/${project._id}/board`}
            className={classes.link}
          >
            <Typography className={classes.textLabelSecondary}>
              {project.title}
            </Typography>
          </NavLink>
        </Grid>
        <Grid container>
          <Typography variant="h5" className={classes.boardText}>
            {project.key} board
          </Typography>
        </Grid>
      </Grid>
      <Grid container className={classes.board}>
        {!loading && project.columns ? (
          <>
            <DragDropContext onDragEnd={handleOnDragEnd}>
              {project.columns.map((column, index) => (
                <Grid
                  item
                  md={3}
                  xs={12}
                  container
                  direction="column"
                  key={index}
                  style={{
                    flexWrap: "nowrap",
                  }}
                >
                  <Grid
                    container
                    justify="space-between"
                    className={classes.colHeader}
                    style={{
                      backgroundColor:
                        column.tasks.length >= column.limit
                          ? "#F9E380"
                          : "#f4f5f7",
                    }}
                  >
                    <Typography className={classes.headerText}>
                      {column.title} {column.tasks.length}{" "}
                      {column.tasks.length === 1 ? "task" : "tasks"}
                    </Typography>
                    {column.tasks.length >= column.limit && (
                      <Typography
                        className={classes.headerText}
                        style={{
                          background: "#F48B00",
                          padding: ".2rem",
                          fontSize: ".7rem",
                          color: "#fff",
                          borderRadius: "4px",
                        }}
                      >
                        {column.limit} max
                      </Typography>
                    )}
                    <Grid
                      item
                      xs={1}
                      container
                      style={{ maxWidth: "1rem" }}
                      onClick={(e) => {
                        if (open && e.target === anchorEl) return closePopper();
                        setAnchorEl(e.target);
                        setActiveCol(column);
                        setOpen(true);
                      }}
                    >
                      <MoreVertical className={classes.moreIcon} />
                    </Grid>
                  </Grid>
                  <Column
                    column={column}
                    projectId={project._id}
                    setProject={props.setProject}
                    fetchAndSetProject={props.fetchAndSetProject}
                    index={index}
                  />
                </Grid>
              ))}
            </DragDropContext>
            {addingNewColumn ? (
              <Column
                newColumn
                addColumnToProject={props.addColumnToProject}
                projectId={project._id}
                setAddingNewColumn={setAddingNewColumn}
              />
            ) : (
              <div className={classes.plusBtn} onClick={() => addNewColumn()}>
                <Plus size={28} />
              </div>
            )}
          </>
        ) : (
          <CircularProgress size={28} />
        )}
      </Grid>
    </Grid>
  );
};

export default BoardsPage;
