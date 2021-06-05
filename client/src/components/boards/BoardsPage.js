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
  const classes = useStyles();
  const [addingNewColumn, setAddingNewColumn] = useState(false);

  const addNewColumn = () => {
    setAddingNewColumn(true);
  };

  const handleOnDragEnd = (result) => {
    const { source, destination } = result;
    console.log(result);
    if (!destination) return;

    const { index: sOrder, droppableId: sourceId } = source;
    const { index: dOrder, droppableId: destId } = destination;
    const [scId, sColIndex] = sourceId.split("-");
    const [dcId, dColIndex] = destId.split("-");
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
