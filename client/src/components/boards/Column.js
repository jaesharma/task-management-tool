import { Grid, Typography, makeStyles } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React, { useEffect, useRef, useState } from "react";
import { Plus } from "react-feather";
import {
  createColumn,
  createTask,
  deleteTask,
} from "../../utility/utilityFunctions/apiCalls";
import TaskBlock from "./TaskBlock";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { setModalStateAction } from "../../actions/modalActions";
import { useDispatch, useSelector } from "react-redux";
import TaskDialog from "../dialogs/TaskDialog";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: "1rem",
    margin: "6px",
    height: "100%",
    overflow: "auto",
    marginTop: 0,
    borderRadius: "0 0 5px 5px",
    background: "#F4F5F7",
    minWidth: "16rem",
    maxWidth: "16rem",
    minHeight: "8rem",
    flexWrap: "nowrap",
    transition: "all ease-in-out .1s",
    "&::-webkit-scrollbar": {
      display: "none",
    },
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
    minHeight: "4rem",
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
  const [taskState, setTaskState] = useState({
    open: false,
    id: null,
  });
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const issueInputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
    if (issueInputRef.current) issueInputRef.current.focus();
  }, [showCreateIssueBox]);

  const changeHandler = (e) => setTitle(e.target.value);

  const createIssueChangeHandler = (e) => setCreaetIssueText(e.target.value);

  const removeTask = (id) => {
    deleteTask(id)
      .then((resp) => {
        const { task: deletedTask } = resp.data;
        let tasks = [...column.tasks];
        tasks.splice(deletedTask.order - 1, 1);
        tasks = tasks.map((task) =>
          task.order >= deletedTask.order
            ? { ...task, order: task.order - 1 }
            : task
        );

        props.setProject((project) => {
          const cols = project.columns.map((col) =>
            col._id === column._id ? { ...col, tasks } : col
          );
          return { ...project, columns: cols };
        });
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

  const showTask = (id) => {
    setTaskState({ open: true, id });
  };

  const closeTask = () => {
    setTaskState({ open: false, id: null });
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
          container
          direction="column"
          ref={provided.innerRef}
          className={`${classes.container} tasks`}
          style={{
            backgroundColor:
              column.tasks.length >= column.limit ? "#F9E380" : "#f4f5f7",
          }}
          onMouseOver={() => setShowCreateBtn(true)}
          onMouseLeave={() => setShowCreateBtn(false)}
        >
          {taskState.open && (
            <TaskDialog
              {...taskState}
              fetchAndSetProject={props.fetchAndSetProject}
              handleClose={closeTask}
            />
          )}
          {column.tasks.map((task, index) => (
            <Draggable key={task._id} draggableId={task._id} index={task.order}>
              {(provided) => (
                <TaskBlock
                  task={task}
                  provided={provided}
                  removeTask={removeTask}
                  index={index}
                  innerref={provided.innerRef}
                  showTask={showTask}
                />
              )}
            </Draggable>
          ))}
          {addingNewTask && (
            <Skeleton
              variant="rect"
              width={230}
              height={118}
              style={{
                marginTop: ".3rem",
                borderRadius: "4px",
                minHeight: "5rem",
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
