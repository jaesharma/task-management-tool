import React from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { Users, LogOut } from "react-feather";
import { logoutAction } from "../../actions/authActions";
import { useDispatch } from "react-redux";
import { Tooltip } from "@material-ui/core";
import { useConfirm } from "material-ui-confirm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserTag } from "@fortawesome/free-solid-svg-icons";
import { useHistory } from "react-router";
import { logout } from "../../utility/utilityFunctions/apiCalls";
import { setModalStateAction } from "../../actions/modalActions";

const MainListItems = ({ active, ...props }) => {
  const confirmation = useConfirm();
  const history = useHistory();
  const dispatch = useDispatch();
  const logoutHandler = () => {
    confirmation({
      description: "You will be logged out.",
      confirmationText: "Logout",
    })
      .then(() => {
        logout()
          .then(() => {
            dispatch(logoutAction());
          })
          .catch((error) => {
            dispatch(
              setModalStateAction({
                showModal: true,
                text: "Something went wrong.",
                severity: "error",
              })
            );
          });
      })
      .catch((_) => {});
  };
  return (
    <div>
      <Tooltip title="users">
        <ListItem
          button
          onClick={() => {
            history.push("/cpanel/users");
          }}
        >
          <ListItemIcon>
            <Users
              style={{
                color: `${active === "users" ? "blue" : "gray"}`,
              }}
            />
          </ListItemIcon>
          <ListItemText primary="Users" />
        </ListItem>
      </Tooltip>
      <Tooltip title="roles">
        <ListItem
          button
          onClick={() => {
            history.push("/cpanel/roles");
          }}
        >
          <ListItemIcon>
            <FontAwesomeIcon
              icon={faUserTag}
              style={{
                fontSize: "1.4rem",
                color: `${active === "roles" ? "blue" : "gray"}`,
              }}
            />
          </ListItemIcon>
          <ListItemText primary="Roles & Permissions" />
        </ListItem>
      </Tooltip>
      <Tooltip title="logout">
        <ListItem button onClick={() => logoutHandler()}>
          <ListItemIcon>
            <LogOut />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </Tooltip>
    </div>
  );
};

export default MainListItems;
