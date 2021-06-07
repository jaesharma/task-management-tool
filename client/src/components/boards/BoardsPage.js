import { CircularProgress, Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import React, { useState } from "react";
import { Plus } from "react-feather";
import { DragDropContext } from "react-beautiful-dnd";
import { NavLink } from "react-router-dom";
import Column from "./Column";
import { shiftTasks } from "../../utility/utilityFunctions/apiCalls";

const useStyles = makeStyles((theme) => ({
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
    padding: ".2rem",
    borderRadius: "2px",
    marginTop: "5px",
    marginLeft: "6px",
  },
}));

const BoardsPage = ({ project, loading, ...props }) => {
  console.log(project.columns)
  const classes = useStyles();
  const [addingNewColumn, setAddingNewColumn] = useState(false);

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

  return (
    <Grid
      container
      direction="column"
      style={{
        padding: "3rem 1rem 0 4rem",
      }}
    >
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
        <NavLink to={`/projects/${project._id}/board`} className={classes.link}>
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
      <Grid
        container
        style={{
          flexWrap: "nowrap",
          marginTop: "2rem",
        }}
      >
        {!loading && project.columns ? (
          <>
            <DragDropContext onDragEnd={handleOnDragEnd}>
              {project.columns.map((column, index) => (
                <Column
                  column={column}
                  projectId={project._id}
                  setProject={props.setProject}
                  index={index}
                />
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
