import React, { useContext } from "react";
import { Button, Icon } from "@ui-kitten/components";
import { PreferencesContext } from "../context/PreferencesContext";

const ThemeToggle = () => {
  const { toggleTheme, isThemeDark } = useContext(PreferencesContext);
  const renderIcon = (props) => (
    <Icon {...props} name={isThemeDark ? "sun" : "moon"} /> 
  );

  return (
    <Button onPress={toggleTheme} accessoryLeft={renderIcon}>
      {isThemeDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    </Button>
  );
};

export default ThemeToggle;
