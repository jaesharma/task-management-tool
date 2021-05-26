import React from "react";
import { CircularProgress, Snackbar, Typography } from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import "../../styles/animations.css";
import { SET_STATIC_MODAL } from "../../actions/actionTypes";
import { connect } from "react-redux";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const StaticModal = ({ staticModalText, showStaticModal, closeModal }) => {
  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      open={showStaticModal}
    >
      <Alert
        severity="info"
        style={{
          backgroundColor: "#FDF4E5",
          color: "black",
        }}
        icon={<CircularProgress color="black" size={22} />}
      >
        <Typography>{staticModalText}</Typography>
      </Alert>
    </Snackbar>
  );
};

const mapStateToProps = (state) => {
  return {
    showStaticModal: state.modalReducer.showStaticModal,
    staticModalText: state.modalReducer.staticModalText,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(StaticModal);
