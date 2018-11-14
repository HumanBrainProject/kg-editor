import { observable, action } from "mobx";

import DefaultTheme from "../Themes/Default";
import BrightTheme from "../Themes/Bright";
import CupcakeTheme from "../Themes/Cupcake";

class AppStore{
  @observable globalError = null;
  @observable currentTheme;

  availableThemes = {
    "default": DefaultTheme,
    "bright": BrightTheme,
    "cupcake": CupcakeTheme
  }

  constructor(){
    let savedTheme = localStorage.getItem("currentTheme");
    this.currentTheme = savedTheme === "bright"? "bright": "default";
  }

  @action
  setGlobalError(error, info){
    this.globalError = {error, info};
  }

  @action
  dismissGlobalError(){
    this.globalError = null;
  }

  setTheme(theme){
    this.currentTheme = this.availableThemes[theme]? theme: "default";
    localStorage.setItem("currentTheme", this.currentTheme);
  }

  toggleTheme(){
    if(this.currentTheme === "bright"){
      this.setTheme("default");
    } else {
      this.setTheme("bright");
    }
  }
}

export default new AppStore();