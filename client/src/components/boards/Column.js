import { Grid, Typography, makeStyles } from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import { Plus } from "react-feather";
import { createColumn } from "../../utility/utilityFunctions/apiCalls";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: "1rem",
    margin: "6px",
    borderRadius: "5px",
    background: "#F4F5F7",
    minHeight: "12rem",
    flexWrap: "nowrap",
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
  addBtn: {
    padding: ".2rem",
    borderRadius: "4px",
    color: "#425272",
    transition: "all ease-in-out .2s",
    "&:hover": {
      background: "rgba(9,30,66,.08)",
      cursor: "pointer",
    },
  },
}));

const Column = ({ projectId, column, newColumn, ...props }) => {
  const classes = useStyles();
  const [showCreateBtn, setShowCreateBtn] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const changeHandler = (e) => {
    setTitle(e.target.value);
  };

  const keyDownHandler = (e) => {
    const { key } = e;
    if (key === "Enter") {
      createColumn({ title, projectId })
        .then((resp) => {
          console.log("resp: ", resp);
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (key === "Escape") {
      props.setAddingNewColumn(false);
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
    <Grid
      item
      xs={3}
      container
      direction="column"
      className={classes.container}
      onMouseEnter={() => setShowCreateBtn(true)}
      onMouseLeave={() => setShowCreateBtn(false)}
    >
      <Typography className={classes.title}>{column.title}</Typography>
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
};

export default Column;
