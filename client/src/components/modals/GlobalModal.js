import React, { useState } from "react";
import { Snackbar, Slide } from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import "../../styles/animations.css";
import { CLOSE_MODAL } from "../../actions/actionTypes";
import { connect } from "react-redux";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const GlobalModal = ({ modalText, showModal, closeModal, severity }) => {
  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      open={showModal}
      onClose={closeModal}
      autoHideDuration={3000}
      style={{
        zIndex: 99999,
      }}
    >
      <Alert severity={severity}>{modalText}</Alert>
    </Snackbar>
  );
};

const mapStateToProps = (state) => {
  return {
    showModal: state.modalReducer.showModal,
    modalText: state.modalReducer.text,
    severity: state.modalReducer.severity,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    closeModal: () => {
      dispatch({ type: CLOSE_MODAL });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(GlobalModal);
