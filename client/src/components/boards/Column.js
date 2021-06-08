import { Grid, Typography, makeStyles } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React, { useEffect, useRef, useState } from "react";
import { Plus } from "react-feather";
import {
  createColumn,
  createTask,
} from "../../utility/utilityFunctions/apiCalls";
import TaskBlock from "./TaskBlock";
import { Draggable, Droppable } from "react-beautiful-dnd";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: "1rem",
    margin: "6px",
    marginTop: 0,
    borderRadius: "0 0 5px 5px",
    background: "#F4F5F7",
    minWidth: "16rem",
    flexWrap: "nowrap",
    transition: "all ease-in-out .1s",
  },
  title: {
    textTransform: "uppercase",
    fontSize: ".8rem",
    fontWeight: 600,
    fontFamily: "Merriweather Sans",
    color: "#777",
  },
  titleInput: {
    border: "none",
    outline: "2px solid #4E9BFF",
    padding: ".5rem",
    fontWeight: 400,
    fontSize: "1rem",
  },
  createIssueTextInput: {
    outline: "none",
    borderRadius: "4px",
    border: "2px solid #4E9BFF",
    padding: ".5rem",
  },
  addBtn: {
    padding: ".2rem",
    borderRadius: "4px",
    color: "#425272",
    transition: "all ease-in-out .2s",
    marginTop: ".4rem",
    "&:hover": {
      background: "rgba(9,30,66,.08)",
      cursor: "pointer",
    },
  },
}));

const Column = ({ projectId, column, newColumn, ...props }) => {
  const classes = useStyles();
  const [showCreateBtn, setShowCreateBtn] = useState(false);
  const [showCreateIssueBox, setShowCreateIssueBox] = useState(false);
  const [title, setTitle] = useState("");
  const [createIssueText, setCreaetIssueText] = useState("");
  const [addingNewTask, setAddingNewTask] = useState(false);
  const inputRef = useRef(null);
  const issueInputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
    if (issueInputRef.current) issueInputRef.current.focus();
  }, [showCreateIssueBox]);

  const changeHandler = (e) => setTitle(e.target.value);

  const createIssueChangeHandler = (e) => setCreaetIssueText(e.target.value);

  const keyDownHandler = (e) => {
    const { key } = e;
    if (key === "Enter") {
      createColumn({ title, projectId })
        .then((resp) => {
          const { column } = resp.data;
          props.addColumnToProject(column);
          props.setAddingNewColumn(false);
          console.log("resp: ", resp);
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (key === "Escape") {
      props.setAddingNewColumn(false);
    }
  };

  const keyDownHandlerForIssue = (e) => {
    const { key } = e;
    if (key === "Enter") {
      setShowCreateIssueBox(false);
      setAddingNewTask(true);
      createTask({ summary: createIssueText, columnId: column._id, projectId })
        .then((resp) => {
          setAddingNewTask(false);
          setShowCreateIssueBox(true);
          props.setProject((project) => {
            const updatedColumns = [...project.columns];
            updatedColumns[props.index].tasks = updatedColumns[
              props.index
            ].tasks.concat(resp.data.task);
            return { ...project, columns: updatedColumns };
          });
        })
        .catch((error) => {
          setAddingNewTask(false);
          console.log(error);
        });
    } else if (key === "Escape") {
      setShowCreateIssueBox(false);
    }
  };

  if (newColumn) {
    return (
      <Grid
        item
        xs={3}
        container
        direction="column"
        className={classes.container}
        style={{
          padding: "3px",
        }}
      >
        <input
          autoFocus
          ref={inputRef}
          className={classes.titleInput}
          value={title}
          name="title-input"
          placeholder="Column name"
          onChange={changeHandler}
          onKeyDown={keyDownHandler}
          onBlur={() => props.setAddingNewColumn(false)}
        />
        <Grid
          container
          direction="column"
          style={{
            flex: 1,
          }}
        ></Grid>
        {showCreateBtn && (
          <Grid container alignItems="flex-end" className={classes.addBtn}>
            <Plus size={19} />
            Create issue
          </Grid>
        )}
      </Grid>
    );
  }

  return (
    <Droppable droppableId={`${column._id}-${props.index}`}>
      {(provided) => (
        <Grid
          item
          xs={3}
          container
          ref={provided.innerRef}
          direction="column"
          className={`${classes.container} tasks`}
          onMouseEnter={() => setShowCreateBtn(true)}
          onMouseLeave={() => setShowCreateBtn(false)}
        >
          <Grid
            container
            direction="column"
            style={{
              flexWrap: "nowrap",
            }}
          >
            {column.tasks.map((task, index) => (
              <Draggable
                key={task._id}
                draggableId={task._id}
                index={task.order}
              >
                {(provided) => (
                  <TaskBlock
                    task={task}
                    provided={provided}
                    innerref={provided.innerRef}
                  />
                )}
              </Draggable>
            ))}
            {addingNewTask && (
              <Skeleton
                variant="rect"
                width={210}
                height={118}
                style={{
                  marginTop: ".3rem",
                  borderRadius: "4px",
                }}
              />
            )}
            {showCreateIssueBox && (
              <textArea
                autoFocus
                ref={issueInputRef}
                rows={4}
                className={classes.createIssueTextInput}
                value={createIssueText}
                name="issue-text"
                placeholder="What needs to be done?"
                onChange={createIssueChangeHandler}
                onKeyDown={keyDownHandlerForIssue}
                onBlur={() => setShowCreateIssueBox(false)}
              />
            )}
          </Grid>
          {showCreateBtn && (
            <Grid
              container
              alignItems="flex-end"
              className={classes.addBtn}
              onClick={() => setShowCreateIssueBox(true)}
            >
              <Plus size={19} />
              Create issue
            </Grid>
          )}
          {provided.placeholder}
        </Grid>
      )}
    </Droppable>
  );
};

export default Column;
